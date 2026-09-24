import type { RegulatoryAreaDataset } from '@domain/entities/regulatoryAreas/RegulatoryAreaDataset'
import type { RegulatoryAreaSummary } from '@domain/entities/regulatoryAreas/RegulatoryAreaSummary'
import type { EnvRegulatoryAreaSummaryRepository } from '@domain/repositories/EnvRegulatoryAreaSummaryRepository'
import type { FishRegulatoryAreaSummaryRepository } from '@domain/repositories/FishRegulatoryAreaSummaryRepository'

export type GetRegulatoryAreasByIdsDependencies = {
  envRegulatoryAreaSummaryRepository: EnvRegulatoryAreaSummaryRepository
  fishRegulatoryAreaSummaryRepository: FishRegulatoryAreaSummaryRepository
}

/** Keeps the order of `ids`: the first tapped area is the topmost one. */
export async function getRegulatoryAreasByIds(
  { envRegulatoryAreaSummaryRepository, fishRegulatoryAreaSummaryRepository }: GetRegulatoryAreasByIdsDependencies,
  dataset: RegulatoryAreaDataset,
  ids: number[]
): Promise<RegulatoryAreaSummary[]> {
  const uniqueIds = [...new Set(ids)]

  if (uniqueIds.length === 0) {
    return []
  }

  const areas: RegulatoryAreaSummary[] =
    dataset === 'fish'
      ? await fishRegulatoryAreaSummaryRepository.findByIds(uniqueIds)
      : await envRegulatoryAreaSummaryRepository.findByIds(uniqueIds)

  const areasById = new Map(areas.map(area => [area.id, area]))

  return uniqueIds.flatMap(id => areasById.get(id) ?? [])
}
