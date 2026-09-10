import type { BoundingBox, Geometry, Position } from '@/types/mapTypes'

type Point = [number, number]

function toPoint(position: Position): Point {
  return [position[0] ?? 0, position[1] ?? 0]
}

function isPointInBbox([lon, lat]: Point, bbox: BoundingBox): boolean {
  return lon >= bbox.minLon && lon <= bbox.maxLon && lat >= bbox.minLat && lat <= bbox.maxLat
}

// standard ray-casting point-in-polygon test
function isPointInRing([lon, lat]: Point, ring: Point[]): boolean {
  let isInside = false

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i] as Point
    const [xj, yj] = ring[j] as Point

    const intersects = yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi

    if (intersects) {
      isInside = !isInside
    }
  }

  return isInside
}

function direction(a: Point, b: Point, c: Point): number {
  return (c[0] - a[0]) * (b[1] - a[1]) - (b[0] - a[0]) * (c[1] - a[1])
}

function doSegmentsIntersect(p1: Point, p2: Point, p3: Point, p4: Point): boolean {
  const d1 = direction(p3, p4, p1)
  const d2 = direction(p3, p4, p2)
  const d3 = direction(p1, p2, p3)
  const d4 = direction(p1, p2, p4)

  return d1 > 0 !== d2 > 0 && d3 > 0 !== d4 > 0
}

function doesRingIntersectBbox(rawRing: Position[], bbox: BoundingBox): boolean {
  const ring = rawRing.map(toPoint)
  const bboxCorners: Point[] = [
    [bbox.minLon, bbox.minLat],
    [bbox.maxLon, bbox.minLat],
    [bbox.maxLon, bbox.maxLat],
    [bbox.minLon, bbox.maxLat]
  ]

  if (ring.some(point => isPointInBbox(point, bbox))) {
    return true
  }

  if (bboxCorners.some(corner => isPointInRing(corner, ring))) {
    return true
  }

  for (let i = 0; i < ring.length - 1; i += 1) {
    const a = ring[i] as Point
    const b = ring[i + 1] as Point

    for (let j = 0; j < bboxCorners.length; j += 1) {
      const c = bboxCorners[j] as Point
      const d = bboxCorners[(j + 1) % bboxCorners.length] as Point

      if (doSegmentsIntersect(a, b, c, d)) {
        return true
      }
    }
  }

  return false
}

/**
 * Checks whether a polygon/multipolygon actually intersects a bbox, as opposed to just their
 * bounding boxes overlapping (which can be true for a large/elongated shape far from the bbox).
 */
export function doesGeometryIntersectBbox(geometry: Geometry, bbox: BoundingBox): boolean {
  const outerRings =
    geometry.type === 'Polygon' ? [geometry.coordinates[0]] : geometry.coordinates.map(polygon => polygon[0])

  return outerRings.some(ring => (ring ? doesRingIntersectBbox(ring, bbox) : false))
}
