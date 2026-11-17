import { getHighlightSegments } from '../getHighlightSegments'

describe('getHighlightSegments', () => {
  it('returns the whole text when there is no query', () => {
    expect(getHighlightSegments('Zone de mouillage', undefined)).toEqual([
      { highlighted: false, text: 'Zone de mouillage' }
    ])
    expect(getHighlightSegments('Zone de mouillage', '  ')).toEqual([{ highlighted: false, text: 'Zone de mouillage' }])
  })

  it('highlights matches ignoring case and accents', () => {
    expect(getHighlightSegments('Réserve de Pêche', 'peche')).toEqual([
      { highlighted: false, text: 'Réserve de ' },
      { highlighted: true, text: 'Pêche' }
    ])
  })

  it('highlights every word and every occurrence of the query', () => {
    expect(getHighlightSegments('mer et Mer, zone', 'mer zone')).toEqual([
      { highlighted: true, text: 'mer' },
      { highlighted: false, text: ' et ' },
      { highlighted: true, text: 'Mer' },
      { highlighted: false, text: ', ' },
      { highlighted: true, text: 'zone' }
    ])
  })

  it('merges overlapping matches', () => {
    expect(getHighlightSegments('mouillage', 'mouil illage')).toEqual([{ highlighted: true, text: 'mouillage' }])
  })
})
