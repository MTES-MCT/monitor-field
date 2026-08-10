import type { FishRegulatoryArea, EnvRegulatoryArea } from '@/types/regulatoryAreasTypes'

export function getRegulatoryAreaLabel(area: FishRegulatoryArea | EnvRegulatoryArea, mode: string): string {
  if (mode === 'MONITORFISH') {
    const { zone, theme, type } = area as FishRegulatoryArea
    return zone || theme || type || `Nom inconnu'`
  }
  const { polyName, resume } = area as EnvRegulatoryArea
  return polyName ?? resume ?? 'Nom inconnu'
}
