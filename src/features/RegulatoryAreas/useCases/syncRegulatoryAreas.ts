import type {
  SyncRegulatoryAreasOptions,
  SyncRegulatoryAreasResult
} from '@domain/useCases/regulatoryAreas/syncRegulatoryAreas'
import { syncRegulatoryAreas as runSyncRegulatoryAreas } from '@domain/useCases/regulatoryAreas/syncRegulatoryAreas'
import { regenerateRegulatoryAreaTiles } from '@domain/useCases/regulatoryAreas/regenerateRegulatoryAreaTiles'
import { getRegulatoryAreasDependencies } from '@infrastructure/di/regulatoryAreas'
import { logSentryError } from '@utils/sentryLogger'

export type { SyncRegulatoryAreasOptions, SyncRegulatoryAreasResult }

export async function syncRegulatoryAreas(
  seaFronts: string[],
  options?: SyncRegulatoryAreasOptions
): Promise<SyncRegulatoryAreasResult> {
  const dependencies = await getRegulatoryAreasDependencies()
  const result = await runSyncRegulatoryAreas(dependencies, seaFronts, options)

  for (const { dataset, error } of result.failures) {
    logSentryError(error, `Unable to sync ${dataset} regulatory areas`)
  }

  const tilesStartedAt = Date.now()
  // eslint-disable-next-line no-console
  console.log('[tiles] tile generation started')

  await regenerateRegulatoryAreaTiles(dependencies, result.changedDatasets)

  // eslint-disable-next-line no-console
  console.log(`[tiles] tile generation finished (${Date.now() - tilesStartedAt}ms)`)

  return result
}
