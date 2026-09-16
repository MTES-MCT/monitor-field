import type { EnvRegulatoryAreaFromDatabase } from '@/types/regulatoryAreasTypes'
import { matchesRegulatoryAreaSearch } from './matchesRegulatoryAreaSearch'
import type { Filters } from '@contexts/RegulatoryAreasContext'
import dayjs from 'dayjs'

function matchesRecentlyAddedOrModified(
  regulatoryArea: EnvRegulatoryAreaFromDatabase,
  recentlyAddedOrModified: boolean
): boolean {
  if (!recentlyAddedOrModified) {
    return true
  }
  return dayjs(regulatoryArea.edition).isAfter(dayjs().subtract(30, 'day'))
}

function matchesThemesAndSubThemes(
  regulatoryArea: EnvRegulatoryAreaFromDatabase,
  themesAndSubThemes: string[]
): boolean {
  if (themesAndSubThemes.length === 0) {
    return true
  }
  return themesAndSubThemes.every(theme => regulatoryArea.themes.includes(theme))
}

export function filterEnvRegulatoryArea(regulatoryArea: EnvRegulatoryAreaFromDatabase, filters: Filters): boolean {
  const matchesSearchQuery = matchesRegulatoryAreaSearch(regulatoryArea, filters.searchQuery, 'MONITORENV ')
  const matchesRecentlyAddedOrModifiedResult = matchesRecentlyAddedOrModified(
    regulatoryArea,
    filters.recentlyAddedOrModified
  )

  const matchesThemesAndSubThemesResult = matchesThemesAndSubThemes(regulatoryArea, filters.themesAndSubThemes)

  return matchesSearchQuery && matchesRecentlyAddedOrModifiedResult && matchesThemesAndSubThemesResult
}
