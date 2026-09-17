import { getDatabase } from '@database/db'
import type { SyncRegulatoryAreasDependencies } from '@domain/useCases/regulatoryAreas/syncRegulatoryAreas'
import { createDataGouvEnvRegulatoryAreaRepository } from '@infrastructure/dataGouv/DataGouvEnvRegulatoryAreaRepository'
import { createSqliteEnvRegulatoryAreaRepository } from '@infrastructure/database/repositories/SqliteEnvRegulatoryAreaRepository'
import { createSqliteFishRegulatoryAreaRepository } from '@infrastructure/database/repositories/SqliteFishRegulatoryAreaRepository'
import { createWFSFishRegulatoryAreaRepository } from '@infrastructure/geoplatform/WFSFishRegulatoryAreaRepository'
import { createMmkvSyncStateRepository } from '@infrastructure/storage/MmkvSyncStateRepository'

let dependenciesPromise: Promise<SyncRegulatoryAreasDependencies> | null = null

async function buildDependencies(): Promise<SyncRegulatoryAreasDependencies> {
  const database = await getDatabase()

  return {
    envRegulatoryAreaRepository: createDataGouvEnvRegulatoryAreaRepository(),
    fishRegulatoryAreaRepository: createWFSFishRegulatoryAreaRepository(),
    localEnvRegulatoryAreaRepository: createSqliteEnvRegulatoryAreaRepository(database),
    localFishRegulatoryAreaRepository: createSqliteFishRegulatoryAreaRepository(database),
    now: () => new Date(),
    syncStateRepository: createMmkvSyncStateRepository()
  }
}

/** Composition root: the only place concrete repositories are chosen. Wired once per process. */
export function getSyncRegulatoryAreasDependencies(): Promise<SyncRegulatoryAreasDependencies> {
  if (!dependenciesPromise) {
    dependenciesPromise = buildDependencies()
  }

  return dependenciesPromise
}
