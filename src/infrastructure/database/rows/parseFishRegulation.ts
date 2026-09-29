import type {
  FishingPeriod,
  FishRegulation,
  GearRegulation,
  RegulatedGears,
  RegulatedSpecies,
  RegulatoryReference,
  SpeciesRegulation
} from '@domain/entities/regulatoryAreas/FishRegulation'
import { logToSentry } from '@utils/sentryLogger'

type RawObject = Record<string, unknown>

export type FishRegulationColumns = {
  id: number
  fishingPeriods: string | null
  gears: string | null
  generalRemarks: string | null
  regulatoryReferences: string | null
  species: string | null
}

// A malformed column is dropped rather than hiding the whole area.
export function parseFishRegulation(area: FishRegulationColumns): FishRegulation {
  return {
    fishingPeriod: toFishingPeriod(parseJson(area.fishingPeriods, 'fishingPeriods', area.id)),
    gearRegulation: toGearRegulation(parseJson(area.gears, 'gears', area.id)),
    generalRemarks: area.generalRemarks || undefined,
    regulatoryReferences: toRegulatoryReferences(parseJson(area.regulatoryReferences, 'regulatoryReferences', area.id)),
    speciesRegulation: toSpeciesRegulation(parseJson(area.species, 'species', area.id))
  }
}

function parseJson(value: string | null, column: string, id: number): unknown {
  if (!value) {
    return undefined
  }

  try {
    return JSON.parse(value)
  } catch {
    logToSentry(`Invalid JSON in fish regulatory area ${column}`, 'info', { extra: { column, id } })

    return undefined
  }
}

function isObject(value: unknown): value is RawObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function toArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value.filter(item => item !== null && item !== undefined) as T[]) : []
}

function toOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

function toRecord<T>(value: unknown): Record<string, T> {
  return isObject(value) ? (value as Record<string, T>) : {}
}

function toFishingPeriod(value: unknown): FishingPeriod | undefined {
  if (!isObject(value)) {
    return undefined
  }

  return {
    ...(value as Partial<FishingPeriod>),
    dateRanges: toArray(value.dateRanges),
    dates: toArray(value.dates),
    timeIntervals: toArray(value.timeIntervals),
    weekdays: toArray(value.weekdays)
  }
}

function toRegulatedGears(value: unknown): RegulatedGears | undefined {
  if (!isObject(value)) {
    return undefined
  }

  return {
    ...(value as Partial<RegulatedGears>),
    regulatedGearCategories: toRecord(value.regulatedGearCategories),
    regulatedGears: toRecord(value.regulatedGears)
  }
}

function toGearRegulation(value: unknown): GearRegulation | undefined {
  if (!isObject(value)) {
    return undefined
  }

  return {
    authorized: toRegulatedGears(value.authorized),
    otherInfo: toOptionalString(value.otherInfo),
    unauthorized: toRegulatedGears(value.unauthorized)
  }
}

function toRegulatedSpecies(value: unknown): RegulatedSpecies | undefined {
  if (!isObject(value)) {
    return undefined
  }

  return {
    allSpecies: value.allSpecies === true,
    species: toArray(value.species),
    speciesGroups: toArray(value.speciesGroups)
  }
}

function toSpeciesRegulation(value: unknown): SpeciesRegulation | undefined {
  if (!isObject(value)) {
    return undefined
  }

  return {
    authorized: toRegulatedSpecies(value.authorized),
    otherInfo: toOptionalString(value.otherInfo),
    unauthorized: toRegulatedSpecies(value.unauthorized)
  }
}

function toRegulatoryReferences(value: unknown): RegulatoryReference[] {
  return toArray<RawObject>(value)
    .filter(isObject)
    .filter(reference => typeof reference.reference === 'string' && reference.reference.length > 0)
    .map(reference => ({
      ...(reference as Partial<RegulatoryReference>),
      reference: reference.reference as string,
      textType: toArray(reference.textType),
      url: toOptionalString(reference.url) ?? ''
    }))
}
