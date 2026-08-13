import { getDatabase } from '@database/db'
import { syncEnvRegulatoryAreas } from '@database/env/envRegulatoryAreasSync'
import { syncFishRegulatoryAreas } from '@database/fish/fishRegulatoryAreasSync'
import { logSentryError } from '@utils/sentryLogger'

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
        logSentryError(e, 'Unable to sync fish regulatory areas')
      })
    )
  }

  if (shouldSyncEnv) {
    syncPromises.push(
      syncEnvRegulatoryAreas(database, facades, forceRefresh).catch(e => {
        logSentryError(e, 'Unable to sync env regulatory areas')
      })
    )
  }

  await Promise.allSettled(syncPromises)
}
