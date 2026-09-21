import type { Geometry } from '@/types/mapTypes'
import { isPointInGeometry } from '../isPointInGeometry'

// a square from (0,0) to (10,10) with a square hole from (4,4) to (6,6)
const squareWithHole: Geometry = {
  coordinates: [
    [
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10],
      [0, 0]
    ],
    [
      [4, 4],
      [6, 4],
      [6, 6],
      [4, 6],
      [4, 4]
    ]
  ],
  type: 'Polygon'
}

describe('isPointInGeometry', () => {
  it('returns true for a point inside the polygon', () => {
    expect(isPointInGeometry([2, 2], squareWithHole)).toBe(true)
  })

  it('returns false for a point outside the polygon', () => {
    expect(isPointInGeometry([20, 20], squareWithHole)).toBe(false)
  })

  it('returns false for a point inside a hole', () => {
    expect(isPointInGeometry([5, 5], squareWithHole)).toBe(false)
  })

  it('returns true for a point inside one part of a multipolygon', () => {
    const geometry: Geometry = {
      coordinates: [
        [
          [
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 1],
            [0, 0]
          ]
        ],
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

    expect(isPointInGeometry([10.5, 10.5], geometry)).toBe(true)
    expect(isPointInGeometry([5, 5], geometry)).toBe(false)
  })

  it('assigns a point on a shared edge to exactly one of two abutting zones', () => {
    // ray casting is half-open, so a tap on the seam must not report both zones
    const left: Geometry = {
      coordinates: [
        [
          [0, 0],
          [5, 0],
          [5, 10],
          [0, 10],
          [0, 0]
        ]
      ],
      type: 'Polygon'
    }
    const right: Geometry = {
      coordinates: [
        [
          [5, 0],
          [10, 0],
          [10, 10],
          [5, 10],
          [5, 0]
        ]
      ],
      type: 'Polygon'
    }

    const matches = [left, right].filter(geometry => isPointInGeometry([5, 5], geometry))

    expect(matches).toHaveLength(1)
  })
})
