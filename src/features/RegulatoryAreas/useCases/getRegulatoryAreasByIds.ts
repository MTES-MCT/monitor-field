import type { AppMode } from '@config/appModes'
import type { RegulatoryAreaSummary } from '@domain/entities/regulatoryAreas/RegulatoryAreaSummary'
import { getRegulatoryAreasByIds as runGetRegulatoryAreasByIds } from '@domain/useCases/regulatoryAreas/getRegulatoryAreasByIds'
import { getRegulatoryAreasDependencies } from '@infrastructure/di/regulatoryAreas'
import { toRegulatoryAreaDataset } from '../utils/toRegulatoryAreaDataset'

export async function getRegulatoryAreasByIds(mode: AppMode, ids: number[]): Promise<RegulatoryAreaSummary[]> {
  const dependencies = await getRegulatoryAreasDependencies()

  return runGetRegulatoryAreasByIds(dependencies, toRegulatoryAreaDataset(mode), ids)
}
