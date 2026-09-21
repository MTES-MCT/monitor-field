import type { Geometry, Position } from '@/types/mapTypes'

type Point = [number, number]

/**
 * Standard ray-casting point-in-polygon test, on a single ring.
 *
 * Reads coordinates positionally and allocates nothing: rings in this dataset run to
 * hundreds of thousands of vertices.
 */
export function isPointInRing(point: Position, ring: Position[]): boolean {
  const lon = point[0] ?? 0
  const lat = point[1] ?? 0
  let isInside = false

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const current = ring[i] as Point
    const previous = ring[j] as Point
    const xi = current[0]
    const yi = current[1]
    const xj = previous[0]
    const yj = previous[1]

    const intersects = yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi

    if (intersects) {
      isInside = !isInside
    }
  }

  return isInside
}

/** A polygon contains the point when an odd number of its rings do, so holes punch through. */
function isPointInPolygon(point: Position, polygon: Position[][]): boolean {
  let isInside = false

  for (const ring of polygon) {
    if (isPointInRing(point, ring)) {
      isInside = !isInside
    }
  }

  return isInside
}

/**
 * Whether a coordinate falls inside a polygon/multipolygon, excluding its holes.
 *
 * Used to resolve a map tap against the areas already loaded in JS, rather than asking
 * the native map, which answers with the full geometry of every match.
 */
export function isPointInGeometry(point: Position, geometry: Geometry): boolean {
  if (geometry.type === 'Polygon') {
    return isPointInPolygon(point, geometry.coordinates)
  }

  for (const polygon of geometry.coordinates) {
    if (isPointInPolygon(point, polygon)) {
      return true
    }
  }

  return false
}
