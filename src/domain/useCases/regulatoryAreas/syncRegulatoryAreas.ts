import type { RegulatoryAreaDataset } from '@domain/entities/regulatoryAreas/RegulatoryAreaDataset'
import type { SyncEnvRegulatoryAreasDependencies } from './syncEnvRegulatoryAreas'
import { syncEnvRegulatoryAreas } from './syncEnvRegulatoryAreas'
import type { SyncFishRegulatoryAreasDependencies } from './syncFishRegulatoryAreas'
import { syncFishRegulatoryAreas } from './syncFishRegulatoryAreas'

export type SyncRegulatoryAreasDependencies = SyncEnvRegulatoryAreasDependencies & SyncFishRegulatoryAreasDependencies

export type SyncRegulatoryAreasOptions = {
  forceRefresh?: boolean
  syncEnv?: boolean
  syncFish?: boolean
}

export type SyncFailure = {
  dataset: RegulatoryAreaDataset
  error: unknown
}

export type SyncRegulatoryAreasResult = {
  failures: SyncFailure[]
  changedDatasets: RegulatoryAreaDataset[]
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
  const changedDatasets: RegulatoryAreaDataset[] = []

  if (fish.status === 'rejected') {
    failures.push({ dataset: 'fish', error: fish.reason })
  } else if (fish.value === true) {
    changedDatasets.push('fish')
  }

  if (env.status === 'rejected') {
    failures.push({ dataset: 'env', error: env.reason })
  } else if (env.value === true) {
    changedDatasets.push('env')
  }

  return { changedDatasets, failures }
}
