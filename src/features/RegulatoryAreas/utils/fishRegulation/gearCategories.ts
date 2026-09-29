import type { Gear, GearCategory, RegulatedGears } from '@domain/entities/regulatoryAreas/FishRegulation'

export const SORTED_CATEGORY_LIST = [
  'Chaluts',
  'Sennes traînantes',
  'Dragues',
  'Filets tournants',
  'Filets maillants et filets emmêlants',
  'Filets soulevés',
  'Lignes et hameçons',
  'Pièges et casiers',
  'Palangres',
  'Gangui',
  'Engins de récolte',
  'Engins divers'
]

export const CATEGORY_LABEL: Record<string, string> = {
  Chaluts: 'Tous les chaluts',
  Dragues: 'Toutes les dragues',
  'Engins de récolte': 'Tous les engins de récolte',
  'Engins divers': 'Tous les engins divers',
  'Filets maillants et filets emmêlants': 'Tous les filets maillants et filets emmêlants',
  'Filets soulevés': 'Tous les filets soulevés',
  'Filets tournants': 'Tous les filets tournants',
  Gangui: 'Tous les gangui',
  'Lignes et hameçons': 'Toutes les lignes et hameçons',
  Palangres: 'Toutes les palangres',
  'Pièges et casiers': 'Tous les pièges et casiers',
  'Sennes traînantes': 'Toutes les sennes traînantes'
}

// MonitorFish reads these groups from its gear referential, which monitorfield does not have.
// Source: `fishing_gear_codes_groups.csv` of the MonitorFish pipeline, joined with `fishing_gears`.
export const TOWED_GEAR_CATEGORIES = ['Chaluts', 'Sennes traînantes', 'Dragues', 'Gangui']
export const PASSIVE_GEAR_CATEGORIES = [
  'Filets maillants et filets emmêlants',
  'Filets soulevés',
  'Lignes et hameçons',
  'Pièges et casiers',
  'Palangres'
]

export const TOWED_GEARS_INFO = 'Chaluts, sennes traînantes, dragues et gangui'
export const PASSIVE_GEARS_INFO =
  'Filets maillants et emmêlants, filets soulevés, lignes et hameçons, pièges et casiers, palangres'

export type GearCategoryRow = {
  name: string
  category: GearCategory | undefined
  gears: Gear[]
}

export function getGearCategoryRows({
  allPassiveGears,
  allTowedGears,
  regulatedGearCategories,
  regulatedGears
}: RegulatedGears): GearCategoryRow[] {
  const coveredCategories = new Set([
    ...(allTowedGears ? TOWED_GEAR_CATEGORIES : []),
    ...(allPassiveGears ? PASSIVE_GEAR_CATEGORIES : [])
  ])
  const gears = Object.values(regulatedGears)

  const names = new Set([
    ...Object.keys(regulatedGearCategories).filter(name => !coveredCategories.has(name)),
    ...gears.map(gear => gear.category ?? '')
  ])
  const sortedNames = [
    ...SORTED_CATEGORY_LIST.filter(name => names.has(name)),
    ...[...names].filter(name => !SORTED_CATEGORY_LIST.includes(name))
  ]

  return sortedNames.map(name => {
    const category = coveredCategories.has(name) ? undefined : regulatedGearCategories[name]

    return {
      category,
      gears: category ? [] : gears.filter(gear => (gear.category ?? '') === name),
      name
    }
  })
}
