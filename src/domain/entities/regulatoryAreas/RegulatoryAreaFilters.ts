import dayjs from 'dayjs'
import { normalizeText } from '@/utils/normalizeText'
import type { EnvRegulatoryAreaSummary, FishRegulatoryAreaSummary } from './RegulatoryAreaSummary'

const RECENTLY_ADDED_OR_MODIFIED_IN_DAYS = 30

export type RegulatoryAreaFilters = {
  searchQuery: string | undefined
  recentlyAddedOrModified: boolean
  themesAndSubThemes: string[]
}

export function hasActiveRegulatoryAreaFilters(filters: RegulatoryAreaFilters): boolean {
  return !!filters.searchQuery?.trim() || filters.recentlyAddedOrModified || filters.themesAndSubThemes.length > 0
}

function matchesSearchQuery(searchableFields: (string | null | undefined)[], searchQuery: string | undefined): boolean {
  const normalizedQuery = searchQuery?.trim() ? normalizeText(searchQuery) : ''

  if (!normalizedQuery) {
    return true
  }

  return searchableFields.some(field => !!field && normalizeText(field).includes(normalizedQuery))
}

export function matchesFishRegulatoryAreaFilters(
  area: FishRegulatoryAreaSummary,
  filters: RegulatoryAreaFilters
): boolean {
  return matchesSearchQuery([area.zone, area.theme, area.type], filters.searchQuery)
}

export function matchesEnvRegulatoryAreaFilters(
  area: EnvRegulatoryAreaSummary,
  filters: RegulatoryAreaFilters,
  now: Date
): boolean {
  if (
    !matchesSearchQuery([area.layerName, area.location, area.refReg, area.resume, area.polyName], filters.searchQuery)
  ) {
    return false
  }

  if (!filters.recentlyAddedOrModified) {
    return true
  }

  return dayjs(area.edition).isAfter(dayjs(now).subtract(RECENTLY_ADDED_OR_MODIFIED_IN_DAYS, 'day'))
}
