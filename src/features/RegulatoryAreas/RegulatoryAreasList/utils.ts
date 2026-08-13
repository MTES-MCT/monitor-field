import type { Filters, RegulatoryAreaListItem } from '@contexts/RegulatoryAreasContext'
import type {
  EnvRegulatoryArea,
  EnvRegulatoryAreaFromDatabase,
  FishRegulatoryArea,
  FishRegulatoryAreaFromDatabase
} from '@/types/regulatoryAreasTypes'
import { normalizeText } from '@/utils/normalizeText'
import dayjs from 'dayjs'

export function matchesRegulatoryAreaSearch(
  area: FishRegulatoryAreaFromDatabase | EnvRegulatoryAreaFromDatabase,
  searchQuery: string | undefined,
  mode: 'MONITORENV ' | 'MONITORFISH'
) {
  const normalizedQuery = searchQuery?.trim() ? normalizeText(searchQuery) : ''

  if (!normalizedQuery) {
    return true
  }

  let searchableFields

  if (mode === 'MONITORFISH') {
    const areaAsFish = area as FishRegulatoryAreaFromDatabase
    searchableFields = [areaAsFish.zone, areaAsFish.theme, areaAsFish.type].filter(Boolean) as string[]
  } else {
    const areaAsEnv = area as EnvRegulatoryAreaFromDatabase
    searchableFields = [
      areaAsEnv.layerName,
      areaAsEnv.location,
      areaAsEnv.refReg,
      areaAsEnv.resume,
      areaAsEnv.polyName
    ].filter(Boolean) as string[]
  }

  return searchableFields.some(field => normalizeText(field).includes(normalizedQuery))
}

function matchesRecentlyAddedOrModified(
  regulatoryArea: EnvRegulatoryAreaFromDatabase,
  recentlyAddedOrModified: boolean
): boolean {
  if (!recentlyAddedOrModified) {
    return true
  }
  return dayjs(regulatoryArea.edition).isAfter(dayjs().subtract(30, 'day'))
}

export function filterEnvRegulatoryAreas(regulatoryArea: EnvRegulatoryAreaFromDatabase, filters: Filters): boolean {
  const matchesSearchQuery = matchesRegulatoryAreaSearch(regulatoryArea, filters.searchQuery, 'MONITORENV ')
  const matchesRecentlyAddedOrModifiedResult = matchesRecentlyAddedOrModified(
    regulatoryArea,
    filters.recentlyAddedOrModified
  )

  return matchesSearchQuery && matchesRecentlyAddedOrModifiedResult
}

export function getRegulatoryAreasByGroup(
  regulatoryAreas: RegulatoryAreaListItem[],
  mode: string
): Record<string, RegulatoryAreaListItem[]> {
  let groupedAreas: Record<string, RegulatoryAreaListItem[]> = {}

  if (mode === 'MONITORFISH') {
    for (const area of regulatoryAreas as FishRegulatoryArea[]) {
      const groupKey = area.zone || 'Zone inconnue'
      if (!groupedAreas[groupKey]) {
        groupedAreas[groupKey] = []
      }
      groupedAreas[groupKey].push(area)
    }
  } else {
    for (const area of regulatoryAreas as EnvRegulatoryArea[]) {
      const groupKey = `${area.layerName} - ${area.location}` || 'Couche inconnue'
      if (!groupedAreas[groupKey]) {
        groupedAreas[groupKey] = []
      }
      groupedAreas[groupKey].push(area)
    }
  }
  return groupedAreas
}
