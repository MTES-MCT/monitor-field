import type { RegulatoryAreaListItem } from '@contexts/RegulatoryAreasContext'
import type {
  EnvRegulatoryAreaSummary,
  FishRegulatoryAreaSummary
} from '@domain/entities/regulatoryAreas/RegulatoryAreaSummary'

export function getRegulatoryAreasByGroup(
  regulatoryAreas: RegulatoryAreaListItem[],
  mode: string
): Record<string, RegulatoryAreaListItem[]> {
  let groupedAreas: Record<string, RegulatoryAreaListItem[]> = {}

  if (mode === 'MONITORFISH') {
    for (const area of regulatoryAreas as FishRegulatoryAreaSummary[]) {
      const groupKey = area.theme || 'Couche inconnue'
      if (!groupedAreas[groupKey]) {
        groupedAreas[groupKey] = []
      }
      groupedAreas[groupKey].push(area)
    }
  } else {
    for (const area of regulatoryAreas as EnvRegulatoryAreaSummary[]) {
      const groupKey = `${area.layerName} ${!!area.location ? `- ${area.location}` : ''}` || 'Couche inconnue'
      if (!groupedAreas[groupKey]) {
        groupedAreas[groupKey] = []
      }
      groupedAreas[groupKey].push(area)
    }
  }
  return groupedAreas
}
