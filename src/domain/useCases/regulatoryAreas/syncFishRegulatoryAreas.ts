import type { FishRegulatoryAreaRepository } from '@domain/repositories/FishRegulatoryAreaRepository'
import type { LocalFishRegulatoryAreaRepository } from '@domain/repositories/LocalFishRegulatoryAreaRepository'
import type { SyncStateRepository } from '@domain/repositories/SyncStateRepository'
import { shouldSkipSync } from './shouldSkipSync'

export type SyncFishRegulatoryAreasDependencies = {
  fishRegulatoryAreaRepository: FishRegulatoryAreaRepository
  localFishRegulatoryAreaRepository: LocalFishRegulatoryAreaRepository
  now: () => Date
  syncStateRepository: SyncStateRepository
}

export async function syncFishRegulatoryAreas(
  {
    fishRegulatoryAreaRepository,
    localFishRegulatoryAreaRepository,
    now,
    syncStateRepository
  }: SyncFishRegulatoryAreasDependencies,
  seaFronts: string[],
  forceRefresh = false
): Promise<void> {
  const selectedSeaFronts = seaFronts.filter(Boolean)

  if (selectedSeaFronts.length === 0) {
    await localFishRegulatoryAreaRepository.deleteAll()
    syncStateRepository.markSyncedAt('fish', now())

    return
  }

  const skip = shouldSkipSync({
    forceRefresh,
    lastSyncedAt: syncStateRepository.lastSyncedAt('fish'),
    now: now(),
    storedAreaCount: await localFishRegulatoryAreaRepository.countAll()
  })

  if (skip) {
    return
  }

  const areas = await fishRegulatoryAreaRepository.findBySeaFronts(selectedSeaFronts)

  // Treated as "nothing published yet", not "everything was withdrawn": stale zones on a
  // field device beat a blank map.
  if (areas.length === 0) {
    return
  }

  await localFishRegulatoryAreaRepository.replaceForSeaFronts(selectedSeaFronts, areas)

  syncStateRepository.markSyncedAt('fish', now())
}
