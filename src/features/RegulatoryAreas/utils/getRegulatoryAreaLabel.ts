import type { FishRegulatoryArea, EnvRegulatoryArea } from '@/types/regulatoryAreasTypes'

export function getRegulatoryAreaLabel(area: FishRegulatoryArea | EnvRegulatoryArea, mode: string): string {
  if (mode === 'MONITORFISH') {
    const { zone, theme, type, id } = area as FishRegulatoryArea
    return zone || theme || type || `Zone #${id}`
  }
  const { layerName, location } = area as EnvRegulatoryArea
  return `${layerName} - ${location}`
}
