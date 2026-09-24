import type { AppMode } from '@config/appModes'
import type { RegulatoryAreaFilters } from '@domain/entities/regulatoryAreas/RegulatoryAreaFilters'
import type { RegulatoryAreaSummary } from '@domain/entities/regulatoryAreas/RegulatoryAreaSummary'
import { getRegulatoryAreasInBoundingBox as runGetRegulatoryAreasInBoundingBox } from '@domain/useCases/regulatoryAreas/getRegulatoryAreasInBoundingBox'
import { getRegulatoryAreasDependencies } from '@infrastructure/di/regulatoryAreas'
import type { BoundingBox } from '@/types/mapTypes'
import { toRegulatoryAreaDataset } from '../utils/toRegulatoryAreaDataset'

export async function getRegulatoryAreasInBoundingBox(
  mode: AppMode,
  boundingBox: BoundingBox,
  filters: RegulatoryAreaFilters
): Promise<RegulatoryAreaSummary[]> {
  const dependencies = await getRegulatoryAreasDependencies()

  return runGetRegulatoryAreasInBoundingBox(dependencies, toRegulatoryAreaDataset(mode), boundingBox, filters)
}
