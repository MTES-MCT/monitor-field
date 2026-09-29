export type DateInterval = {
  endDate?: string | null
  startDate?: string | null
}

export type TimeInterval = {
  /** i.e. '00h00' */
  from?: string | null
  /** i.e. '02h00' */
  to?: string | null
}

export type FishingPeriod = {
  always?: boolean | null
  annualRecurrence?: boolean | null
  authorized?: boolean | null
  dateRanges: DateInterval[]
  dates: string[]
  daytime?: boolean | null
  holidays?: boolean | null
  otherInfo?: string | null
  timeIntervals: TimeInterval[]
  weekdays: string[]
}

export type GearMeshSizeEqualityComparator =
  | 'between'
  | 'equal'
  | 'greaterThan'
  | 'greaterThanOrEqualTo'
  | 'lowerThan'
  | 'lowerThanOrEqualTo'

export type Gear = {
  category?: string | null
  code: string
  mesh?: string[] | null
  meshType?: GearMeshSizeEqualityComparator | null
  name?: string | null
  remarks?: string | null
}

export type GearCategory = {
  mesh?: string[] | null
  meshType?: GearMeshSizeEqualityComparator | null
  name: string
  remarks?: string | null
}

export type RegulatedGears = {
  allGears?: boolean | null
  allPassiveGears?: boolean | null
  allTowedGears?: boolean | null
  derogation?: boolean | null
  regulatedGearCategories: Record<string, GearCategory>
  regulatedGears: Record<string, Gear>
}

export type GearRegulation = {
  authorized: RegulatedGears | undefined
  otherInfo?: string | null
  unauthorized: RegulatedGears | undefined
}

export type RegulatedSpeciesDetail = {
  /** FAO code */
  code: string
  name?: string | null
  remarks?: string | null
}

export type RegulatedSpecies = {
  allSpecies?: boolean | null
  species: RegulatedSpeciesDetail[]
  speciesGroups: string[]
}

export type SpeciesRegulation = {
  authorized: RegulatedSpecies | undefined
  otherInfo?: string | null
  unauthorized: RegulatedSpecies | undefined
}

export type RegulatoryTextType = 'creation' | 'regulation'

export type RegulatoryReference = {
  /** An ISO date, or `infinite` */
  endDate?: string | null
  reference: string
  startDate?: string | null
  textType: RegulatoryTextType[]
  url: string
}

export type FishRegulation = {
  fishingPeriod: FishingPeriod | undefined
  gearRegulation: GearRegulation | undefined
  generalRemarks: string | undefined
  regulatoryReferences: RegulatoryReference[]
  speciesRegulation: SpeciesRegulation | undefined
}

export function hasRegulatedGears(regulatedGears: RegulatedGears | undefined): regulatedGears is RegulatedGears {
  return (
    !!regulatedGears &&
    (!!regulatedGears.allGears ||
      !!regulatedGears.allTowedGears ||
      !!regulatedGears.allPassiveGears ||
      Object.keys(regulatedGears.regulatedGears).length > 0 ||
      Object.keys(regulatedGears.regulatedGearCategories).length > 0 ||
      !!regulatedGears.derogation)
  )
}

export function hasRegulatedSpecies(
  regulatedSpecies: RegulatedSpecies | undefined
): regulatedSpecies is RegulatedSpecies {
  return (
    !!regulatedSpecies &&
    (!!regulatedSpecies.allSpecies || regulatedSpecies.species.length > 0 || regulatedSpecies.speciesGroups.length > 0)
  )
}

export function hasGearRegulation(gearRegulation: GearRegulation | undefined): gearRegulation is GearRegulation {
  return (
    !!gearRegulation &&
    (hasRegulatedGears(gearRegulation.authorized) ||
      hasRegulatedGears(gearRegulation.unauthorized) ||
      !!gearRegulation.otherInfo)
  )
}

export function hasSpeciesRegulation(
  speciesRegulation: SpeciesRegulation | undefined
): speciesRegulation is SpeciesRegulation {
  return (
    !!speciesRegulation &&
    (hasRegulatedSpecies(speciesRegulation.authorized) ||
      hasRegulatedSpecies(speciesRegulation.unauthorized) ||
      !!speciesRegulation.otherInfo)
  )
}

export function isOutdated({ endDate }: RegulatoryReference, today: Date): boolean {
  if (!endDate || endDate === 'infinite') {
    return false
  }

  const end = new Date(endDate)

  return !Number.isNaN(end.getTime()) && end < today
}

export function hasOutdatedReference(references: RegulatoryReference[], today: Date): boolean {
  return references.some(reference => isOutdated(reference, today))
}
