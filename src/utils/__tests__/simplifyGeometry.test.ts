/// <reference types="jest" />

import type { Geometry } from '@/types/mapTypes'
import { GEOMETRY_SIMPLIFICATION_TOLERANCE, minimumVisibleBboxSize, simplifyGeometry } from '@utils/simplifyGeometry'

describe('simplifyGeometry', () => {
  it('removes near-collinear points while keeping the ring closed', () => {
    const ring: number[][] = [
      [0, 0],
      [0, 0.00001],
      [0, 0.00002],
      [0, 1],
      [1, 1],
      [1, 0],
      [0, 0]
    ]
    const geometry: Geometry = { type: 'Polygon', coordinates: [ring] }

    const simplified = simplifyGeometry(geometry, GEOMETRY_SIMPLIFICATION_TOLERANCE)
    const simplifiedRing = simplified.type === 'Polygon' ? simplified.coordinates[0] : undefined

    expect(simplifiedRing).toBeDefined()
    expect(simplifiedRing!.length).toBeLessThan(ring.length)
    expect(simplifiedRing![0]).toEqual(simplifiedRing![simplifiedRing!.length - 1])
  })

  it('keeps a small ring intact when simplification would collapse it', () => {
    const ring: number[][] = [
      [0, 0],
      [0, 1],
      [1, 0],
      [0, 0]
    ]
    const geometry: Geometry = { type: 'Polygon', coordinates: [ring] }

    expect(simplifyGeometry(geometry, GEOMETRY_SIMPLIFICATION_TOLERANCE)).toEqual(geometry)
  })

  it('simplifies every polygon of a MultiPolygon', () => {
    const ring: number[][] = [
      [0, 0],
      [0, 0.00001],
      [0, 1],
      [1, 1],
      [1, 0],
      [0, 0]
    ]
    const geometry: Geometry = { type: 'MultiPolygon', coordinates: [[ring]] }

    const simplified = simplifyGeometry(geometry, GEOMETRY_SIMPLIFICATION_TOLERANCE)

    expect(simplified.type).toBe('MultiPolygon')
    expect(simplified.coordinates[0]![0]!.length).toBeLessThan(ring.length)
  })

  it('computes a zoom-dependent minimum visible bbox size', () => {
    expect(minimumVisibleBboxSize(4)).toBeCloseTo(0.0879, 3)
    expect(minimumVisibleBboxSize(8)).toBeCloseTo(0.00549, 5)
    expect(minimumVisibleBboxSize(undefined)).toBe(0)
  })
})
