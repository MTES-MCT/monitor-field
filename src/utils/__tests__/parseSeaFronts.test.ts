import { parseSeaFronts } from '../parseSeaFronts'

describe('parseSeaFronts', () => {
  it('splits comma-separated values', () => {
    expect(parseSeaFronts('MED,NAMO,MEMN')).toEqual(['MED', 'NAMO', 'MEMN'])
  })

  it('returns an empty array when input is undefined', () => {
    expect(parseSeaFronts(undefined)).toEqual([])
  })

  it('returns an empty array when input is empty', () => {
    expect(parseSeaFronts('')).toEqual([])
  })

  it('filters empty values created by duplicate or trailing commas', () => {
    expect(parseSeaFronts('MED,,NAMO,')).toEqual(['MED', 'NAMO'])
  })

  it('does not trim items', () => {
    expect(parseSeaFronts('MED, NAMO')).toEqual(['MED', ' NAMO'])
  })
})
