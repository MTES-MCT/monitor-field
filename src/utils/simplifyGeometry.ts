import type { Geometry, Position } from '@/types/mapTypes'

/**
 * Douglas-Peucker tolerance, in degrees (geometries are EPSG:4326).
 * 0.0005° is ≈ 55m of latitude and ≈ 38m of longitude at 46°N — visually imperceptible at the
 * zoom levels the app uses, while collapsing the dense vertices of the source datasets.
 */
export const GEOMETRY_SIMPLIFICATION_TOLERANCE = 0.0005

/**
 * Coarse tolerance, in degrees (≈5km), for the overview geometry used when zoomed out.
 */
export const GEOMETRY_COARSE_SIMPLIFICATION_TOLERANCE = 0.05

/** Below this zoom level the app renders the coarse geometry instead of the detailed one. */
export const COARSE_GEOMETRY_ZOOM_THRESHOLD = 8

export function isCoarseGeometryLevel(zoom: number | undefined): boolean {
  return zoom !== undefined && zoom < COARSE_GEOMETRY_ZOOM_THRESHOLD
}

/** Hard upper bound on how many areas a single query may return, to keep the bridge/UI bounded. */
export const MAX_REGULATORY_AREAS_PER_QUERY = 1500

/**
 * Minimum bbox side (in degrees) a feature needs to be worth rendering at `zoom` (≈2px).
 * Below this the feature is sub-pixel and is culled, so a country-scale viewport never loads
 * thousands of invisible areas.
 */
export function minimumVisibleBboxSize(zoom: number | undefined): number {
  if (zoom === undefined) {
    return 0
  }

  // 360° of longitude = 512 * 2^zoom px in Web Mercator.
  return 1.40625 / 2 ** zoom
}

type Point = [number, number]

function toPoint(position: Position): Point {
  return [position[0] ?? 0, position[1] ?? 0]
}

function perpendicularDistance(point: Point, start: Point, end: Point): number {
  const dx = end[0] - start[0]
  const dy = end[1] - start[1]
  const magnitude = Math.hypot(dx, dy)

  if (magnitude === 0) {
    return Math.hypot(point[0] - start[0], point[1] - start[1])
  }

  // |cross(start→end, start→point)| / |start→end|
  return Math.abs(dy * point[0] - dx * point[1] + end[0] * start[1] - end[1] * start[0]) / magnitude
}

function douglasPeucker(positions: Position[], tolerance: number): Position[] {
  const length = positions.length

  if (length <= 2) {
    return positions
  }

  const keep = new Array<boolean>(length).fill(false)
  keep[0] = true
  keep[length - 1] = true

  const stack: Array<[number, number]> = [[0, length - 1]]

  while (stack.length > 0) {
    const range = stack.pop()
    if (!range) {
      break
    }
    const [startIndex, endIndex] = range
    const start = toPoint(positions[startIndex]!)
    const end = toPoint(positions[endIndex]!)

    let maxDistance = 0
    let maxIndex = -1

    for (let i = startIndex + 1; i < endIndex; i += 1) {
      const distance = perpendicularDistance(toPoint(positions[i]!), start, end)

      if (distance > maxDistance) {
        maxDistance = distance
        maxIndex = i
      }
    }

    if (maxIndex !== -1 && maxDistance > tolerance) {
      keep[maxIndex] = true
      stack.push([startIndex, maxIndex])
      stack.push([maxIndex, endIndex])
    }
  }

  return positions.filter((_, index) => keep[index] === true)
}

function isClosed(ring: Position[]): boolean {
  const first = ring[0]
  const last = ring[ring.length - 1]

  return !!first && !!last && first[0] === last[0] && first[1] === last[1]
}

function simplifyRing(ring: Position[], tolerance: number): Position[] {
  const closed = isClosed(ring)
  const openRing = closed ? ring.slice(0, -1) : ring

  const simplified = douglasPeucker(openRing, tolerance)

  // A valid polygon ring needs at least 3 distinct positions; fall back to the original if
  // simplification would collapse it below that.
  if (simplified.length < 3) {
    return ring
  }

  if (closed) {
    const closing = simplified[0]

    return closing ? [...simplified, closing] : ring
  }

  return simplified
}

export function simplifyGeometry(geometry: Geometry, tolerance: number): Geometry {
  if (geometry.type === 'Polygon') {
    return {
      type: 'Polygon',
      coordinates: geometry.coordinates.map(ring => simplifyRing(ring, tolerance))
    }
  }

  return {
    type: 'MultiPolygon',
    coordinates: geometry.coordinates.map(polygon => polygon.map(ring => simplifyRing(ring, tolerance)))
  }
}
