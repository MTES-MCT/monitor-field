import type { EnvRegulatoryAreaFromDatabase, FishRegulatoryAreaFromDatabase } from '@/types/regulatoryAreasTypes'
import { normalizeText } from '@/utils/normalizeText'

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
