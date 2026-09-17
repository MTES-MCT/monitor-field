import type { EnvRegulatoryAreaRepository } from '@domain/repositories/EnvRegulatoryAreaRepository'
import type { LocalEnvRegulatoryAreaRepository } from '@domain/repositories/LocalEnvRegulatoryAreaRepository'
import type { SyncStateRepository } from '@domain/repositories/SyncStateRepository'
import { shouldSkipSync } from './shouldSkipSync'

export type SyncEnvRegulatoryAreasDependencies = {
  envRegulatoryAreaRepository: EnvRegulatoryAreaRepository
  localEnvRegulatoryAreaRepository: LocalEnvRegulatoryAreaRepository
  now: () => Date
  syncStateRepository: SyncStateRepository
}

export async function syncEnvRegulatoryAreas(
  {
    envRegulatoryAreaRepository,
    localEnvRegulatoryAreaRepository,
    now,
    syncStateRepository
  }: SyncEnvRegulatoryAreasDependencies,
  seaFronts: string[],
  forceRefresh = false
): Promise<void> {
  const selectedSeaFronts = seaFronts.filter(Boolean)

  if (selectedSeaFronts.length === 0) {
    await localEnvRegulatoryAreaRepository.deleteAll()
    syncStateRepository.markSyncedAt('env', now())

    return
  }

  const skip = shouldSkipSync({
    forceRefresh,
    lastSyncedAt: syncStateRepository.lastSyncedAt('env'),
    now: now(),
    storedAreaCount: await localEnvRegulatoryAreaRepository.countAll()
  })

  if (skip) {
    return
  }

  const areas = await envRegulatoryAreaRepository.findBySeaFronts(selectedSeaFronts)

  // Treated as "nothing published yet", not "everything was withdrawn": stale zones on a
  // field device beat a blank map.
  if (areas.length === 0) {
    return
  }

  await localEnvRegulatoryAreaRepository.replaceForSeaFronts(selectedSeaFronts, areas)

  syncStateRepository.markSyncedAt('env', now())
}
