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

export function filterEnvRegulatoryArea(regulatoryArea: EnvRegulatoryAreaFromDatabase, filters: Filters): boolean {
  const matchesSearchQuery = matchesRegulatoryAreaSearch(regulatoryArea, filters.searchQuery, 'MONITORENV ')
  const matchesRecentlyAddedOrModifiedResult = matchesRecentlyAddedOrModified(
    regulatoryArea,
    filters.recentlyAddedOrModified
  )

  return matchesSearchQuery && matchesRecentlyAddedOrModifiedResult
}
