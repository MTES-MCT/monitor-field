import { getDatabase } from '@database/db'
import { syncEnvRegulatoryAreas } from '@database/env/envRegulatoryAreasSync'
import { syncFishRegulatoryAreas } from '@database/fish/fishRegulatoryAreasSync'

export type SyncRegulatoryAreasOptions = {
  forceRefresh?: boolean
  syncEnv?: boolean
  syncFish?: boolean
}

export async function syncRegulatoryAreasDB(facades: string[], options?: SyncRegulatoryAreasOptions) {
  const database = await getDatabase()
  const forceRefresh = options?.forceRefresh === true
  const shouldSyncEnv = options?.syncEnv !== false
  const shouldSyncFish = options?.syncFish !== false

  const syncPromises: Promise<unknown>[] = []

  if (shouldSyncFish) {
    syncPromises.push(
      syncFishRegulatoryAreas(database, facades, forceRefresh).catch(e => {
        // oxlint-disable-next-line no-console
        console.warn('Unable to sync fish regulatory areas', e)
      })
    )
  }

  if (shouldSyncEnv) {
    syncPromises.push(
      syncEnvRegulatoryAreas(database, facades, forceRefresh).catch(e => {
        // oxlint-disable-next-line no-console
        console.warn('Unable to sync env regulatory areas', e)
      })
    )
  }

  await Promise.allSettled(syncPromises)
}
