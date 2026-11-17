import { matchesSearchQuery } from '../RegulatoryAreaFilters'

describe('matchesSearchQuery', () => {
  it('returns true when search query is empty', () => {
    expect(matchesSearchQuery(['field1', 'field2'], '')).toBe(true)
  })

  it('returns true when all words in the search query are present in the searchable fields', () => {
    expect(matchesSearchQuery(['APB - Ilôts du Golfe'], 'APB ilots du golfe')).toBe(true)
  })

  it('returns true when not all words in the search query are present in the searchable fields', () => {
    expect(matchesSearchQuery(['APB - Ilôts du Golfe', 'ZMEL', 'zone'], 'ilots golfe')).toBe(true)
  })

  it('returns true when words in the search query are present in the searchable fields with special characters', () => {
    expect(matchesSearchQuery(['APB - Ilôts du Golfe', 'ZMEL & APB', 'zone !'], 'golfe zmel')).toBe(true)
  })

  it('returns false when any word in the search query is not present in the searchable fields', () => {
    expect(matchesSearchQuery(['ZMEL', 'Zone du sud de la cale'], 'apb')).toBe(false)
  })
})
