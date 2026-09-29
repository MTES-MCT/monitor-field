import type { RegulatedGears } from '@domain/entities/regulatoryAreas/FishRegulation'
import { getGearCategoryRows } from '../gearCategories'

const OTT = { category: 'Chaluts', code: 'OTT', name: 'Chaluts jumeaux à panneaux' }
const SDN = { category: 'Sennes traînantes', code: 'SDN', name: 'Sennes danoises' }

describe('getGearCategoryRows', () => {
  it('groups categories and gears in the MonitorFish order', () => {
    const regulatedGears: RegulatedGears = {
      regulatedGearCategories: { Dragues: { name: 'Dragues' } },
      regulatedGears: { OTT, SDN, XXX: { category: 'Inconnue', code: 'XXX' } }
    }

    expect(getGearCategoryRows(regulatedGears)).toEqual([
      { category: undefined, gears: [OTT], name: 'Chaluts' },
      { category: undefined, gears: [SDN], name: 'Sennes traînantes' },
      { category: { name: 'Dragues' }, gears: [], name: 'Dragues' },
      { category: undefined, gears: [{ category: 'Inconnue', code: 'XXX' }], name: 'Inconnue' }
    ])
  })

  it('leaves out categories covered by all towed gears', () => {
    const regulatedGears: RegulatedGears = {
      allTowedGears: true,
      regulatedGearCategories: { Chaluts: { name: 'Chaluts' }, Palangres: { name: 'Palangres' } },
      regulatedGears: {}
    }

    expect(getGearCategoryRows(regulatedGears)).toEqual([
      { category: { name: 'Palangres' }, gears: [], name: 'Palangres' }
    ])
  })

  it('includes gangui in all towed gears', () => {
    const regulatedGears: RegulatedGears = {
      allTowedGears: true,
      regulatedGearCategories: { Gangui: { name: 'Gangui' } },
      regulatedGears: {}
    }

    expect(getGearCategoryRows(regulatedGears)).toEqual([])
  })

  it('includes longlines in all passive gears', () => {
    const regulatedGears: RegulatedGears = {
      allPassiveGears: true,
      regulatedGearCategories: { 'Filets tournants': { name: 'Filets tournants' }, Palangres: { name: 'Palangres' } },
      regulatedGears: {}
    }

    expect(getGearCategoryRows(regulatedGears)).toEqual([
      { category: { name: 'Filets tournants' }, gears: [], name: 'Filets tournants' }
    ])
  })
})
