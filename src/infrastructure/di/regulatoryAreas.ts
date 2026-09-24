import { getDatabase } from '@database/db'
import type { RegulatoryAreaTileRepository } from '@domain/repositories/RegulatoryAreaTileRepository'
import type { GetMatchingRegulatoryAreaIdsDependencies } from '@domain/useCases/regulatoryAreas/getMatchingRegulatoryAreaIds'
import type { GetRegulatoryAreasByIdsDependencies } from '@domain/useCases/regulatoryAreas/getRegulatoryAreasByIds'
import type { GetRegulatoryAreasInBoundingBoxDependencies } from '@domain/useCases/regulatoryAreas/getRegulatoryAreasInBoundingBox'
import type { RegenerateRegulatoryAreaTilesDependencies } from '@domain/useCases/regulatoryAreas/regenerateRegulatoryAreaTiles'
import type { SyncRegulatoryAreasDependencies } from '@domain/useCases/regulatoryAreas/syncRegulatoryAreas'
import { createDataGouvEnvRegulatoryAreaRepository } from '@infrastructure/dataGouv/DataGouvEnvRegulatoryAreaRepository'
import { createSqliteEnvRegulatoryAreaRepository } from '@infrastructure/database/repositories/SqliteEnvRegulatoryAreaRepository'
import { createSqliteFishRegulatoryAreaRepository } from '@infrastructure/database/repositories/SqliteFishRegulatoryAreaRepository'
import { createSqliteEnvRegulatoryAreaSummaryRepository } from '@infrastructure/database/repositories/SqliteEnvRegulatoryAreaSummaryRepository'
import { createSqliteFishRegulatoryAreaSummaryRepository } from '@infrastructure/database/repositories/SqliteFishRegulatoryAreaSummaryRepository'
import { createSqliteRegulatoryAreaGeometryRepository } from '@infrastructure/database/repositories/SqliteRegulatoryAreaGeometryRepository'
import { createWFSFishRegulatoryAreaRepository } from '@infrastructure/geoplatform/WFSFishRegulatoryAreaRepository'
import { createMmkvSyncStateRepository } from '@infrastructure/storage/MmkvSyncStateRepository'
import { createFileSystemRegulatoryAreaTileRepository } from '@infrastructure/tiles/FileSystemRegulatoryAreaTileRepository'

export type RegulatoryAreasDependencies = SyncRegulatoryAreasDependencies &
  RegenerateRegulatoryAreaTilesDependencies &
  GetRegulatoryAreasInBoundingBoxDependencies &
  GetMatchingRegulatoryAreaIdsDependencies &
  GetRegulatoryAreasByIdsDependencies

let dependenciesPromise: Promise<RegulatoryAreasDependencies> | null = null
let regulatoryAreaTileRepository: RegulatoryAreaTileRepository | null = null

async function buildDependencies(): Promise<RegulatoryAreasDependencies> {
  const database = await getDatabase()

  return {
    envRegulatoryAreaRepository: createDataGouvEnvRegulatoryAreaRepository(),
    envRegulatoryAreaSummaryRepository: createSqliteEnvRegulatoryAreaSummaryRepository(database),
    fishRegulatoryAreaRepository: createWFSFishRegulatoryAreaRepository(),
    fishRegulatoryAreaSummaryRepository: createSqliteFishRegulatoryAreaSummaryRepository(database),
    localEnvRegulatoryAreaRepository: createSqliteEnvRegulatoryAreaRepository(database),
    localFishRegulatoryAreaRepository: createSqliteFishRegulatoryAreaRepository(database),
    now: () => new Date(),
    regulatoryAreaGeometryRepository: createSqliteRegulatoryAreaGeometryRepository(database),
    regulatoryAreaTileRepository: getRegulatoryAreaTileRepository(),
    syncStateRepository: createMmkvSyncStateRepository()
  }
}

/** Composition root: the only place concrete repositories are chosen. Wired once per process. */
export function getRegulatoryAreasDependencies(): Promise<RegulatoryAreasDependencies> {
  if (!dependenciesPromise) {
    dependenciesPromise = buildDependencies()
  }

  return dependenciesPromise
}

/** Synchronous, unlike the others: the map source needs the tiles URL on its first render. */
export function getRegulatoryAreaTileRepository(): RegulatoryAreaTileRepository {
  if (!regulatoryAreaTileRepository) {
    regulatoryAreaTileRepository = createFileSystemRegulatoryAreaTileRepository()
  }

  return regulatoryAreaTileRepository
}
