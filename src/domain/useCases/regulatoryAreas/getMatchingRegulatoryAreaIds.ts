import type { RegulatoryAreaDataset } from '@domain/entities/regulatoryAreas/RegulatoryAreaDataset'
import {
  matchesEnvRegulatoryAreaFilters,
  matchesFishRegulatoryAreaFilters,
  type RegulatoryAreaFilters
} from '@domain/entities/regulatoryAreas/RegulatoryAreaFilters'
import type { EnvRegulatoryAreaSummaryRepository } from '@domain/repositories/EnvRegulatoryAreaSummaryRepository'
import type { FishRegulatoryAreaSummaryRepository } from '@domain/repositories/FishRegulatoryAreaSummaryRepository'

export type GetMatchingRegulatoryAreaIdsDependencies = {
  now: () => Date
  envRegulatoryAreaSummaryRepository: EnvRegulatoryAreaSummaryRepository
  fishRegulatoryAreaSummaryRepository: FishRegulatoryAreaSummaryRepository
}

export async function getMatchingRegulatoryAreaIds(
  {
    now,
    envRegulatoryAreaSummaryRepository,
    fishRegulatoryAreaSummaryRepository
  }: GetMatchingRegulatoryAreaIdsDependencies,
  dataset: RegulatoryAreaDataset,
  filters: RegulatoryAreaFilters
): Promise<number[]> {
  if (dataset === 'fish') {
    const areas = await fishRegulatoryAreaSummaryRepository.findAll()

    return areas.filter(area => matchesFishRegulatoryAreaFilters(area, filters)).map(area => area.id)
  }

  const areas = await envRegulatoryAreaSummaryRepository.findAll()
  const currentDate = now()

  return areas.filter(area => matchesEnvRegulatoryAreaFilters(area, filters, currentDate)).map(area => area.id)
}
