import type {
  FishRegulatoryAreaSummary,
  EnvRegulatoryAreaSummary
} from '@domain/entities/regulatoryAreas/RegulatoryAreaSummary'

export function getRegulatoryAreaLabel(
  area: FishRegulatoryAreaSummary | EnvRegulatoryAreaSummary,
  mode: string
): string {
  if (mode === 'MONITORFISH') {
    const { zone } = area as FishRegulatoryAreaSummary
    return zone ?? `Nom inconnu'`
  }
  const { polyName, resume } = area as EnvRegulatoryAreaSummary
  return polyName ?? resume ?? 'Nom inconnu'
}
