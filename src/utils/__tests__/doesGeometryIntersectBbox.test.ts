import type { BoundingBox, Geometry } from '@/types/mapTypes'
import { doesGeometryIntersectBbox } from '../doesGeometryIntersectBbox'

const searchBbox: BoundingBox = { maxLat: 49, maxLon: -3, minLat: 48, minLon: -4 }

describe('doesGeometryIntersectBbox', () => {
  it('returns true when the polygon overlaps the bbox', () => {
    const geometry: Geometry = {
      coordinates: [
        [
          [-3.5, 48.5],
          [-3.4, 48.5],
          [-3.4, 48.6],
          [-3.5, 48.6],
          [-3.5, 48.5]
        ]
      ],
      type: 'Polygon'
    }

    expect(doesGeometryIntersectBbox(geometry, searchBbox)).toBe(true)
  })

  it('returns false when only the shape bounding box overlaps but the polygon itself does not', () => {
    // an elongated L-shaped polygon whose overall bbox covers the search bbox,
    // but whose actual body sits far away from it (the reported bug)
    const geometry: Geometry = {
      coordinates: [
        [
          [-10, 49.5],
          [-9, 49.5],
          [-9, 49.6],
          [-2, 49.6],
          [-2, 49.7],
          [-10, 49.7],
          [-10, 49.5]
        ]
      ],
      type: 'Polygon'
    }

    expect(doesGeometryIntersectBbox(geometry, searchBbox)).toBe(false)
  })

  it('returns true when the bbox is fully contained inside the polygon', () => {
    const geometry: Geometry = {
      coordinates: [
        [
          [-10, 40],
          [10, 40],
          [10, 55],
          [-10, 55],
          [-10, 40]
        ]
      ],
      type: 'Polygon'
    }

    expect(doesGeometryIntersectBbox(geometry, searchBbox)).toBe(true)
  })

  it('returns true when a multipolygon part intersects the bbox', () => {
    const geometry: Geometry = {
      coordinates: [
        [
          [
            [10, 10],
            [11, 10],
            [11, 11],
            [10, 11],
            [10, 10]
          ]
        ],
        [
          [
            [-3.5, 48.5],
            [-3.4, 48.5],
            [-3.4, 48.6],
            [-3.5, 48.6],
            [-3.5, 48.5]
          ]
        ]
      ],
      type: 'MultiPolygon'
    }

    expect(doesGeometryIntersectBbox(geometry, searchBbox)).toBe(true)
  })

  it('returns false when no part of the multipolygon intersects the bbox', () => {
    const geometry: Geometry = {
      coordinates: [
        [
          [
            [10, 10],
            [11, 10],
            [11, 11],
            [10, 11],
            [10, 10]
          ]
        ]
      ],
      type: 'MultiPolygon'
    }

    expect(doesGeometryIntersectBbox(geometry, searchBbox)).toBe(false)
  })
})
