import { FISH_REGULATORY_AREAS_RESPONSE } from '@infrastructure/geoplatform/__tests__/__fixtures__/fishRegulatoryAreasResponse'
import { parseFishRegulation } from '../parseFishRegulation'

jest.mock('@utils/sentryLogger', () => ({
  logToSentry: jest.fn()
}))

function toColumns(index: number) {
  const { properties } = FISH_REGULATORY_AREAS_RESPONSE.features[index]!

  return {
    fishingPeriods: properties.periodes,
    gears: properties.engins,
    generalRemarks: properties.remarques_generales,
    id: index,
    regulatoryReferences: properties.reglementations,
    species: properties.especes
  }
}

describe('parseFishRegulation', () => {
  it('parses every JSON column of a complete area', () => {
    const regulation = parseFishRegulation(toColumns(0))

    expect(regulation.fishingPeriod).toMatchObject({ always: true, authorized: false, dateRanges: [] })
    expect(regulation.gearRegulation?.authorized).toEqual({
      allGears: false,
      regulatedGearCategories: {},
      regulatedGears: {}
    })
    expect(regulation.gearRegulation?.unauthorized?.regulatedGearCategories).toEqual({
      Dragues: { name: 'Dragues' }
    })
    expect(regulation.speciesRegulation).toEqual({
      authorized: undefined,
      otherInfo: undefined,
      unauthorized: {
        allSpecies: false,
        species: [{ code: 'SCE', name: 'Coquille St-Jacques atlantique' }],
        speciesGroups: []
      }
    })
    expect(regulation.regulatoryReferences).toEqual([
      expect.objectContaining({
        endDate: 'infinite',
        reference: 'Arrêté Préfectoral R53-2024-03-07-00006 - délib 2024-005 / NAMO',
        textType: ['regulation', 'creation']
      })
    ])
  })

  it('keeps null sub-objects undefined', () => {
    const regulation = parseFishRegulation(toColumns(1))

    expect(regulation.gearRegulation).toEqual({ authorized: undefined, otherInfo: undefined, unauthorized: undefined })
    expect(regulation.fishingPeriod).toMatchObject({ dates: [], timeIntervals: [], weekdays: [] })
  })

  it('returns an empty regulation for empty columns', () => {
    expect(parseFishRegulation(toColumns(2))).toEqual({
      fishingPeriod: undefined,
      gearRegulation: undefined,
      generalRemarks: undefined,
      regulatoryReferences: [],
      speciesRegulation: undefined
    })
  })

  it('drops a malformed column', () => {
    const regulation = parseFishRegulation({ ...toColumns(0), gears: '{not json' })

    expect(regulation.gearRegulation).toBeUndefined()
    expect(regulation.speciesRegulation).toBeDefined()
  })
})
