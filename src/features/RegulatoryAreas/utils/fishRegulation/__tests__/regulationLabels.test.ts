import { formatCodeAndName, getMeshLabel, getRegulatoryTextTypeLabel } from '../regulationLabels'

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

describe('formatCodeAndName', () => {
  it('appends the name when known', () => {
    expect(formatCodeAndName('OTT', 'Chaluts jumeaux à panneaux')).toBe('OTT (Chaluts jumeaux à panneaux)')
    expect(formatCodeAndName('OTT', undefined)).toBe('OTT')
    expect(formatCodeAndName('OTT', '')).toBe('OTT')
  })
})
