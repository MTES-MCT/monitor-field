import type { BoundingBox, Geometry, Position } from '@/types/mapTypes'
import { isPointInRing } from '@utils/isPointInGeometry'

// Rings here run to hundreds of thousands of vertices, so the helpers read coordinates
// positionally from the stored arrays instead of mapping each position into a new `[lon, lat]`
// tuple first (which would allocate an array per vertex on every check).

function lon(position: Position): number {
  return position[0] ?? 0
}

function lat(position: Position): number {
  return position[1] ?? 0
}

function isPointInBbox(position: Position, bbox: BoundingBox): boolean {
  const lng = lon(position)
  const latValue = lat(position)

  return lng >= bbox.minLon && lng <= bbox.maxLon && latValue >= bbox.minLat && latValue <= bbox.maxLat
}

function direction(a: Position, b: Position, c: Position): number {
  return (lon(c) - lon(a)) * (lat(b) - lat(a)) - (lon(b) - lon(a)) * (lat(c) - lat(a))
}

function doSegmentsIntersect(p1: Position, p2: Position, p3: Position, p4: Position): boolean {
  const d1 = direction(p3, p4, p1)
  const d2 = direction(p3, p4, p2)
  const d3 = direction(p1, p2, p3)
  const d4 = direction(p1, p2, p4)

  return d1 > 0 !== d2 > 0 && d3 > 0 !== d4 > 0
}

function doesRingIntersectBbox(rawRing: Position[], bbox: BoundingBox): boolean {
  const bboxCorners: Position[] = [
    [bbox.minLon, bbox.minLat],
    [bbox.maxLon, bbox.minLat],
    [bbox.maxLon, bbox.maxLat],
    [bbox.minLon, bbox.maxLat]
  ]

  if (rawRing.some(position => isPointInBbox(position, bbox))) {
    return true
  }

  if (bboxCorners.some(corner => isPointInRing(corner, rawRing))) {
    return true
  }

  for (let i = 0; i < rawRing.length - 1; i += 1) {
    const a = rawRing[i]
    const b = rawRing[i + 1]

    if (!a || !b) {
      continue
    }

    for (let j = 0; j < bboxCorners.length; j += 1) {
      const c = bboxCorners[j]
      const d = bboxCorners[(j + 1) % bboxCorners.length]

      if (c && d && doSegmentsIntersect(a, b, c, d)) {
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
