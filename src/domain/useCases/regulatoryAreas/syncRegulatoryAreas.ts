import type { SyncedDataset } from '@domain/repositories/SyncStateRepository'
import type { SyncEnvRegulatoryAreasDependencies } from './syncEnvRegulatoryAreas'
import { syncEnvRegulatoryAreas } from './syncEnvRegulatoryAreas'
import type { SyncFishRegulatoryAreasDependencies } from './syncFishRegulatoryAreas'
import { syncFishRegulatoryAreas } from './syncFishRegulatoryAreas'

export type SyncRegulatoryAreasDependencies = SyncEnvRegulatoryAreasDependencies &
  SyncFishRegulatoryAreasDependencies

export type SyncRegulatoryAreasOptions = {
  forceRefresh?: boolean
  syncEnv?: boolean
  syncFish?: boolean
}

export type SyncFailure = {
  dataset: SyncedDataset
  error: unknown
}

export type SyncRegulatoryAreasResult = {
  failures: SyncFailure[]
}

/**
 * Fans out to both dataset syncs. One side failing must not abort the other: stale fish zones
 * next to fresh env zones still beat a blank map on a field device.
 */
export async function syncRegulatoryAreas(
  dependencies: SyncRegulatoryAreasDependencies,
  seaFronts: string[],
  options?: SyncRegulatoryAreasOptions
): Promise<SyncRegulatoryAreasResult> {
  const forceRefresh = options?.forceRefresh === true

  const [fish, env] = await Promise.allSettled([
    options?.syncFish === false ? null : syncFishRegulatoryAreas(dependencies, seaFronts, forceRefresh),
    options?.syncEnv === false ? null : syncEnvRegulatoryAreas(dependencies, seaFronts, forceRefresh)
  ])

  const failures: SyncFailure[] = []

  if (fish.status === 'rejected') {
    failures.push({ dataset: 'fish', error: fish.reason })
  }

  if (env.status === 'rejected') {
    failures.push({ dataset: 'env', error: env.reason })
  }

  return { failures }
}
