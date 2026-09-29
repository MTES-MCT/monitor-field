import {
  hasGearRegulation,
  hasOutdatedReference,
  hasRegulatedGears,
  hasRegulatedSpecies,
  hasSpeciesRegulation,
  isOutdated,
  type RegulatedGears,
  type RegulatoryReference
} from '../FishRegulation'

const EMPTY_GEARS: RegulatedGears = { regulatedGearCategories: {}, regulatedGears: {} }
const TODAY = new Date('2026-09-29T00:00:00.000Z')
const REFERENCE: RegulatoryReference = { reference: 'Arrêté', textType: [], url: '' }

describe('hasRegulatedGears', () => {
  it('is false for missing or empty gears', () => {
    expect(hasRegulatedGears(undefined)).toBe(false)
    expect(hasRegulatedGears({ ...EMPTY_GEARS, allGears: false })).toBe(false)
  })

  it('is true with any regulated content', () => {
    expect(hasRegulatedGears({ ...EMPTY_GEARS, allTowedGears: true })).toBe(true)
    expect(hasRegulatedGears({ ...EMPTY_GEARS, regulatedGearCategories: { Dragues: { name: 'Dragues' } } })).toBe(true)
  })
})

describe('hasRegulatedSpecies', () => {
  it('checks species, groups and all species', () => {
    expect(hasRegulatedSpecies(undefined)).toBe(false)
    expect(hasRegulatedSpecies({ species: [], speciesGroups: [] })).toBe(false)
    expect(hasRegulatedSpecies({ species: [], speciesGroups: ['Bivalves'] })).toBe(true)
    expect(hasRegulatedSpecies({ allSpecies: true, species: [], speciesGroups: [] })).toBe(true)
  })
})

describe('hasGearRegulation', () => {
  it('is true with regulated gears or other info', () => {
    expect(hasGearRegulation(undefined)).toBe(false)
    expect(hasGearRegulation({ authorized: EMPTY_GEARS, unauthorized: undefined })).toBe(false)
    expect(hasGearRegulation({ authorized: undefined, unauthorized: { ...EMPTY_GEARS, allGears: true } })).toBe(true)
    expect(hasGearRegulation({ authorized: undefined, otherInfo: 'cf. article 6', unauthorized: undefined })).toBe(true)
  })
})

describe('hasSpeciesRegulation', () => {
  it('is true with regulated species or other info', () => {
    expect(hasSpeciesRegulation(undefined)).toBe(false)
    expect(hasSpeciesRegulation({ authorized: { species: [], speciesGroups: [] }, unauthorized: undefined })).toBe(
      false
    )
    expect(
      hasSpeciesRegulation({
        authorized: { allSpecies: true, species: [], speciesGroups: [] },
        unauthorized: undefined
      })
    ).toBe(true)
    expect(hasSpeciesRegulation({ authorized: undefined, otherInfo: 'NB', unauthorized: undefined })).toBe(true)
  })
})

describe('isOutdated', () => {
  it('is true only for a past end date', () => {
    expect(isOutdated({ ...REFERENCE, endDate: 'infinite' }, TODAY)).toBe(false)
    expect(isOutdated({ ...REFERENCE, endDate: undefined }, TODAY)).toBe(false)
    expect(isOutdated({ ...REFERENCE, endDate: 'not a date' }, TODAY)).toBe(false)
    expect(isOutdated({ ...REFERENCE, endDate: '2027-01-01' }, TODAY)).toBe(false)
    expect(isOutdated({ ...REFERENCE, endDate: '2025-01-01' }, TODAY)).toBe(true)
  })
})

describe('hasOutdatedReference', () => {
  it('is true when one reference is outdated', () => {
    expect(hasOutdatedReference([], TODAY)).toBe(false)
    expect(hasOutdatedReference([{ ...REFERENCE, endDate: 'infinite' }], TODAY)).toBe(false)
    expect(
      hasOutdatedReference(
        [
          { ...REFERENCE, endDate: 'infinite' },
          { ...REFERENCE, endDate: '2025-01-01' }
        ],
        TODAY
      )
    ).toBe(true)
  })
})
