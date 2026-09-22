import type {
  SyncRegulatoryAreasOptions,
  SyncRegulatoryAreasResult
} from '@domain/useCases/regulatoryAreas/syncRegulatoryAreas'
import { syncRegulatoryAreas as runSyncRegulatoryAreas } from '@domain/useCases/regulatoryAreas/syncRegulatoryAreas'
import { getSyncRegulatoryAreasDependencies } from '@infrastructure/di/regulatoryAreas'
import { regenerateRegulatoryAreaTiles } from '@infrastructure/tiles/generateRegulatoryAreaTiles'
import { logSentryError } from '@utils/sentryLogger'

export type { SyncRegulatoryAreasOptions, SyncRegulatoryAreasResult }

export async function syncRegulatoryAreas(
  seaFronts: string[],
  options?: SyncRegulatoryAreasOptions
): Promise<SyncRegulatoryAreasResult> {
  const dependencies = await getSyncRegulatoryAreasDependencies()
  const result = await runSyncRegulatoryAreas(dependencies, seaFronts, options)

  for (const { dataset, error } of result.failures) {
    logSentryError(error, `Unable to sync ${dataset} regulatory areas`)
  }

  await regenerateRegulatoryAreaTiles()

  return result
}
