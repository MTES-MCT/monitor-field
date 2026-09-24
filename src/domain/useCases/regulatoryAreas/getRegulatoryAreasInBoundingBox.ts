import type { RegulatoryAreaDataset } from '@domain/entities/regulatoryAreas/RegulatoryAreaDataset'
import {
  matchesEnvRegulatoryAreaFilters,
  matchesFishRegulatoryAreaFilters,
  type RegulatoryAreaFilters
} from '@domain/entities/regulatoryAreas/RegulatoryAreaFilters'
import {
  computeBoundingBoxSurface,
  type RegulatoryAreaSummary
} from '@domain/entities/regulatoryAreas/RegulatoryAreaSummary'
import type { EnvRegulatoryAreaSummaryRepository } from '@domain/repositories/EnvRegulatoryAreaSummaryRepository'
import type { FishRegulatoryAreaSummaryRepository } from '@domain/repositories/FishRegulatoryAreaSummaryRepository'
import type { BoundingBox } from '@/types/mapTypes'

export type GetRegulatoryAreasInBoundingBoxDependencies = {
  now: () => Date
  envRegulatoryAreaSummaryRepository: EnvRegulatoryAreaSummaryRepository
  fishRegulatoryAreaSummaryRepository: FishRegulatoryAreaSummaryRepository
}

async function findMatchingAreas(
  {
    now,
    envRegulatoryAreaSummaryRepository,
    fishRegulatoryAreaSummaryRepository
  }: GetRegulatoryAreasInBoundingBoxDependencies,
  dataset: RegulatoryAreaDataset,
  boundingBox: BoundingBox,
  filters: RegulatoryAreaFilters
): Promise<RegulatoryAreaSummary[]> {
  if (dataset === 'fish') {
    const areas = await fishRegulatoryAreaSummaryRepository.findOverlapping(boundingBox)

    return areas.filter(area => matchesFishRegulatoryAreaFilters(area, filters))
  }

  const areas = await envRegulatoryAreaSummaryRepository.findOverlapping(boundingBox)
  const currentDate = now()

  return areas.filter(area => matchesEnvRegulatoryAreaFilters(area, filters, currentDate))
}

export async function getRegulatoryAreasInBoundingBox(
  dependencies: GetRegulatoryAreasInBoundingBoxDependencies,
  dataset: RegulatoryAreaDataset,
  boundingBox: BoundingBox,
  filters: RegulatoryAreaFilters
): Promise<RegulatoryAreaSummary[]> {
  const areas = await findMatchingAreas(dependencies, dataset, boundingBox, filters)

  return areas.sort((a, b) => computeBoundingBoxSurface(b.bbox) - computeBoundingBoxSurface(a.bbox))
}
