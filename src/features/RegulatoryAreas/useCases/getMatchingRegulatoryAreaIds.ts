import type { AppMode } from '@config/appModes'
import type { RegulatoryAreaFilters } from '@domain/entities/regulatoryAreas/RegulatoryAreaFilters'
import { getMatchingRegulatoryAreaIds as runGetMatchingRegulatoryAreaIds } from '@domain/useCases/regulatoryAreas/getMatchingRegulatoryAreaIds'
import { getRegulatoryAreasDependencies } from '@infrastructure/di/regulatoryAreas'
import { toRegulatoryAreaDataset } from '../utils/toRegulatoryAreaDataset'

export async function getMatchingRegulatoryAreaIds(mode: AppMode, filters: RegulatoryAreaFilters): Promise<number[]> {
  const dependencies = await getRegulatoryAreasDependencies()

  return runGetMatchingRegulatoryAreaIds(dependencies, toRegulatoryAreaDataset(mode), filters)
}
