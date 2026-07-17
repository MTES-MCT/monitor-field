import type { RegulatoryAreaListItem } from '@contexts/RegulatoryAreasContext'
import type { FishRegulatoryArea } from '@database/fish/getFishRegulatoryAreasQuery'

export function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

export function matchesRegulatoryAreaSearch(area: FishRegulatoryArea, searchQuery: string | undefined) {
  const normalizedQuery = searchQuery?.trim() ? normalizeText(searchQuery) : ''

  if (!normalizedQuery) {
    return true
  }

  const searchableFields = [area.zone, area.theme, area.type].filter(Boolean) as string[]

  return searchableFields.some(field => normalizeText(field).includes(normalizedQuery))
}

export function getRegulatoryAreasByGroup(
  regulatoryAreas: RegulatoryAreaListItem[]
): Record<string, RegulatoryAreaListItem[]> {
  const groupedAreas: Record<string, RegulatoryAreaListItem[]> = {}

  for (const area of regulatoryAreas) {
    const groupKey = area.zone || 'Zone inconnue'
    if (!groupedAreas[groupKey]) {
      groupedAreas[groupKey] = []
    }
    groupedAreas[groupKey].push(area)
  }

  return groupedAreas
}
