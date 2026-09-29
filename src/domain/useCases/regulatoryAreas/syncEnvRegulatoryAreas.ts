import type { EnvRegulatoryAreaRepository } from '@domain/repositories/EnvRegulatoryAreaRepository'
import type { LocalEnvRegulatoryAreaRepository } from '@domain/repositories/LocalEnvRegulatoryAreaRepository'
import type { LocalEnvThemesRepository } from '@domain/repositories/LocalEnvThemesRepository'
import type { SyncStateRepository } from '@domain/repositories/SyncStateRepository'
import { extractEnvThemesFromAreas } from './extractEnvThemesFromAreas'
import { shouldSkipSync } from './shouldSkipSync'

export type SyncEnvRegulatoryAreasDependencies = {
  envRegulatoryAreaRepository: EnvRegulatoryAreaRepository
  localEnvRegulatoryAreaRepository: LocalEnvRegulatoryAreaRepository
  localEnvThemesRepository: LocalEnvThemesRepository
  now: () => Date
  syncStateRepository: SyncStateRepository
}

/**
 * Syncs the env dataset and reports whether its stored data actually changed, so callers can
 * decide whether the tiles need to be rebuilt.
 */
export async function syncEnvRegulatoryAreas(
  {
    envRegulatoryAreaRepository,
    localEnvRegulatoryAreaRepository,
    localEnvThemesRepository,
    now,
    syncStateRepository
  }: SyncEnvRegulatoryAreasDependencies,
  seaFronts: string[],
  forceRefresh = false
): Promise<boolean> {
  const selectedSeaFronts = seaFronts.filter(Boolean)

  if (selectedSeaFronts.length === 0) {
    await localEnvRegulatoryAreaRepository.deleteAll()
    await localEnvThemesRepository.replaceAll([])
    syncStateRepository.markSyncedAt('env', now())

    return true
  }

  const skip = shouldSkipSync({
    forceRefresh,
    lastSyncedAt: syncStateRepository.lastSyncedAt('env'),
    now: now(),
    storedAreaCount: await localEnvRegulatoryAreaRepository.countAll()
  })

  if (skip) {
    return false
  }

  const areas = await envRegulatoryAreaRepository.findBySeaFronts(selectedSeaFronts)

  // Treated as "nothing published yet", not "everything was withdrawn": stale zones on a
  // field device beat a blank map.
  if (areas.length === 0) {
    return false
  }

  await localEnvRegulatoryAreaRepository.replaceForSeaFronts(selectedSeaFronts, areas)
  await localEnvThemesRepository.replaceAll(extractEnvThemesFromAreas(areas))

  syncStateRepository.markSyncedAt('env', now())

  return true
}
