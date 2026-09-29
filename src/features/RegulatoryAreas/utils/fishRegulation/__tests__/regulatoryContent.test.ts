import type { RegulatedGears } from '@domain/entities/regulatoryAreas/FishRegulation'
import {
  getMeshLabel,
  getRegulatoryTextTypeLabel,
  isReferenceOutdated,
  regulatedGearsIsNotEmpty,
  regulatedSpeciesIsNotEmpty
} from '../regulatoryContent'

const EMPTY_GEARS: RegulatedGears = { regulatedGearCategories: {}, regulatedGears: {} }

describe('regulatedGearsIsNotEmpty', () => {
  it('is false for missing or empty gears', () => {
    expect(regulatedGearsIsNotEmpty(undefined)).toBe(false)
    expect(regulatedGearsIsNotEmpty({ ...EMPTY_GEARS, allGears: false })).toBe(false)
  })

  it('is true with any regulated content', () => {
    expect(regulatedGearsIsNotEmpty({ ...EMPTY_GEARS, allTowedGears: true })).toBe(true)
    expect(
      regulatedGearsIsNotEmpty({ ...EMPTY_GEARS, regulatedGearCategories: { Dragues: { name: 'Dragues' } } })
    ).toBe(true)
  })
})

describe('regulatedSpeciesIsNotEmpty', () => {
  it('checks species, groups and all species', () => {
    expect(regulatedSpeciesIsNotEmpty(undefined)).toBe(false)
    expect(regulatedSpeciesIsNotEmpty({ species: [], speciesGroups: [] })).toBe(false)
    expect(regulatedSpeciesIsNotEmpty({ species: [], speciesGroups: ['Bivalves'] })).toBe(true)
    expect(regulatedSpeciesIsNotEmpty({ allSpecies: true, species: [], speciesGroups: [] })).toBe(true)
  })
})

describe('getRegulatoryTextTypeLabel', () => {
  it('labels the text types', () => {
    expect(getRegulatoryTextTypeLabel([])).toBeUndefined()
    expect(getRegulatoryTextTypeLabel(['regulation'])).toBe('Réglementation de zone')
    expect(getRegulatoryTextTypeLabel(['creation', 'regulation'])).toBe('Création et réglementation de zone')
  })
})

describe('getMeshLabel', () => {
  it('labels the mesh comparator', () => {
    expect(getMeshLabel({ name: 'Chaluts' })).toBeUndefined()
    expect(getMeshLabel({ mesh: ['80'], name: 'Chaluts' })).toBe('Maillage supérieur à 80 mm')
    expect(getMeshLabel({ mesh: ['80'], meshType: 'lowerThanOrEqualTo', name: 'Chaluts' })).toBe(
      'Maillage inférieur ou égal à 80 mm'
    )
    expect(getMeshLabel({ mesh: ['70', '90'], meshType: 'between', name: 'Chaluts' })).toBe(
      'Maillage entre 70 et 90 mm'
    )
  })
})

describe('isReferenceOutdated', () => {
  const today = new Date('2026-09-29T00:00:00.000Z')
  const reference = { reference: 'Arrêté', textType: [], url: '' }

  it('is true only for a past end date', () => {
    expect(isReferenceOutdated({ ...reference, endDate: 'infinite' }, today)).toBe(false)
    expect(isReferenceOutdated({ ...reference, endDate: undefined }, today)).toBe(false)
    expect(isReferenceOutdated({ ...reference, endDate: '2027-01-01' }, today)).toBe(false)
    expect(isReferenceOutdated({ ...reference, endDate: '2025-01-01' }, today)).toBe(true)
  })
})
