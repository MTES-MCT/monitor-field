/// <reference types="jest" />

import { estimateTileErrorMeters, formatTileError } from '@utils/estimateTileError'

describe('estimateTileErrorMeters', () => {
  it('returns undefined for an unknown zoom', () => {
    expect(estimateTileErrorMeters(undefined)).toBeUndefined()
  })

  it('shrinks as zoom increases', () => {
    expect(estimateTileErrorMeters(8)!).toBeGreaterThan(estimateTileErrorMeters(11)!)
  })

  it('reports a conservative bound at an overview zoom', () => {
    expect(estimateTileErrorMeters(8)).toBeCloseTo(152.9, 1)
  })

  it('reports renderer-limited precision (~7 cm) at the finest zoom', () => {
    expect(estimateTileErrorMeters(11)).toBeCloseTo(0.07, 2)
  })

  it('freezes at the tile max zoom when overzoomed', () => {
    expect(estimateTileErrorMeters(14)).toEqual(estimateTileErrorMeters(11))
  })

  it('uses the integer tile zoom for fractional zoom values', () => {
    expect(estimateTileErrorMeters(11.7)).toEqual(estimateTileErrorMeters(11))
  })
})

describe('formatTileError', () => {
  it('formats centimeter-scale errors', () => {
    expect(formatTileError(0.01)).toBe('~1 cm')
  })

  it('formats meter-scale errors', () => {
    expect(formatTileError(115)).toBe('~115 m')
  })

  it('formats kilometer-scale errors', () => {
    expect(formatTileError(2446)).toBe('~2.4 km')
  })

  it('falls back when the error is unknown', () => {
    expect(formatTileError(undefined)).toBe('~?')
  })
})
