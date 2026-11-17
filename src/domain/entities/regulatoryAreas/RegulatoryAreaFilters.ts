import dayjs from 'dayjs'
import { normalizeText } from '@/utils/normalizeText'
import type { EnvRegulatoryAreaSummary, FishRegulatoryAreaSummary } from './RegulatoryAreaSummary'
import type { AppMode } from '@config/appModes'

const RECENTLY_ADDED_OR_MODIFIED_IN_DAYS = 30

type ThemesFilters = {
  name: string
  subThemes: string[]
}
export type RegulatoryAreaFilters = {
  searchQueryEnv: string | undefined
  searchQueryFish: string | undefined
  recentlyAddedOrModified: boolean
  themes: ThemesFilters[]
}

export function hasActiveRegulatoryAreaFilters(filters: RegulatoryAreaFilters, mode: AppMode): boolean {
  if (mode === 'MONITORFISH') {
    return !!filters.searchQueryFish?.trim()
  }

  return !!filters.searchQueryEnv?.trim() || filters.recentlyAddedOrModified || filters.themes.length > 0
}

export function matchesSearchQuery(
  searchableFields: (string | null | undefined)[],
  searchQuery: string | undefined
): boolean {
  const words = toSearchWords(searchQuery)

  if (words.length === 0) {
    return true
  }

  const searchableText = toSearchWords(searchableFields.filter(Boolean).join(' ')).join(' ')

  return words.every(word => searchableText.includes(word))
}

// Normalizes case/accents and replaces special characters by spaces, then splits into words
function toSearchWords(value: string | undefined): string[] {
  if (!value) {
    return []
  }

  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter(Boolean)
}

function matchesThemesAndSubThemes(area: EnvRegulatoryAreaSummary, themesFilter: ThemesFilters[]): boolean {
  if (themesFilter.length === 0) {
    return true
  }

  if (!area.themes) {
    return false
  }

  const parsedThemes = area.themes ? Object.entries(JSON.parse(area.themes)) : []
  const subThemes = parsedThemes
    ?.flatMap(([_, subTheme]) => subTheme)
    .map(subTheme => normalizeText(subTheme as string))

  const flattenSubThemesFilters = themesFilter.flatMap(theme => [
    ...theme.subThemes.map(subTheme => normalizeText(subTheme))
  ])

  return flattenSubThemesFilters.some(themeOrSubTheme => {
    return subThemes.includes(themeOrSubTheme)
  })
}

export function matchesFishRegulatoryAreaFilters(
  area: FishRegulatoryAreaSummary,
  filters: RegulatoryAreaFilters
): boolean {
  return matchesSearchQuery(
    [
      area.zone,
      area.theme,
      area.type,
      String(area.regulation.fishingPeriod),
      String(area.regulation.gearRegulation),
      String(area.regulation.generalRemarks),
      String(area.regulation.regulatoryReferences),
      String(area.regulation.speciesRegulation)
    ],
    filters.searchQueryFish
  )
}

export function matchesEnvRegulatoryAreaFilters(
  area: EnvRegulatoryAreaSummary,
  filters: RegulatoryAreaFilters,
  now: Date
): boolean {
  if (
    !matchesSearchQuery(
      [area.layerName, area.location, area.refReg, area.resume, area.polyName],
      filters.searchQueryEnv
    )
  ) {
    return false
  }
  if (!matchesThemesAndSubThemes(area, filters.themes)) {
    return false
  }

  if (!filters.recentlyAddedOrModified) {
    return true
  }

  return dayjs(area.edition).isAfter(dayjs(now).subtract(RECENTLY_ADDED_OR_MODIFIED_IN_DAYS, 'day'))
}
