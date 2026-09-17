import type { EnvRegulatoryAreaRepository } from '@domain/repositories/EnvRegulatoryAreaRepository'
import type { FishRegulatoryAreaRepository } from '@domain/repositories/FishRegulatoryAreaRepository'
import type { SyncRegulatoryAreasDependencies } from '../syncRegulatoryAreas'
import { syncRegulatoryAreas } from '../syncRegulatoryAreas'
import {
  buildEnvArea,
  buildFishArea,
  createInMemoryLocalEnvRepository,
  createInMemoryLocalFishRepository,
  createInMemorySyncStateRepository
} from './fakes'

const SEA_FRONTS = ['NAMO', 'MEMN']

function buildDependencies(overrides: Partial<SyncRegulatoryAreasDependencies> = {}) {
  const localFish = createInMemoryLocalFishRepository()
  const localEnv = createInMemoryLocalEnvRepository()
  const syncState = createInMemorySyncStateRepository()

  const fishRemote: FishRegulatoryAreaRepository = {
    findBySeaFronts: async () => [buildFishArea(1, 'NAMO')]
  }
  const envRemote: EnvRegulatoryAreaRepository = {
    findBySeaFronts: async () => [buildEnvArea(10, 'MEMN')]
  }

  const dependencies: SyncRegulatoryAreasDependencies = {
    envRegulatoryAreaRepository: envRemote,
    fishRegulatoryAreaRepository: fishRemote,
    localEnvRegulatoryAreaRepository: localEnv.repository,
    localFishRegulatoryAreaRepository: localFish.repository,
    now: () => new Date('2026-09-17T08:00:00Z'),
    syncStateRepository: syncState.repository,
    ...overrides
  }

  return { dependencies, localEnv, localFish, syncState }
}

describe('syncRegulatoryAreas', () => {
  it('syncs both datasets by default', async () => {
    const { dependencies, localEnv, localFish } = buildDependencies()

    const result = await syncRegulatoryAreas(dependencies, SEA_FRONTS)

    expect(result.failures).toEqual([])
    expect(localFish.storedIds).toEqual([1])
    expect(localEnv.storedIds).toEqual([10])
  })

  it('leaves fish untouched when syncFish is false', async () => {
    const { dependencies, localEnv, localFish } = buildDependencies()

    const result = await syncRegulatoryAreas(dependencies, SEA_FRONTS, { syncFish: false })

    expect(result.failures).toEqual([])
    expect(localFish.replaceCallCount).toBe(0)
    expect(localEnv.storedIds).toEqual([10])
  })

  it('still syncs env when fish fails, and reports the failure', async () => {
    const { dependencies, localEnv } = buildDependencies({
      fishRegulatoryAreaRepository: {
        findBySeaFronts: async () => {
          throw new Error('WFS unreachable')
        }
      }
    })

    const result = await syncRegulatoryAreas(dependencies, SEA_FRONTS)

    expect(result.failures).toHaveLength(1)
    expect(result.failures[0]?.dataset).toBe('fish')
    expect(localEnv.storedIds).toEqual([10])
  })

  it('forwards forceRefresh so a fresh sync is not skipped', async () => {
    const localFish = createInMemoryLocalFishRepository([buildFishArea(99, 'NAMO')])
    const { dependencies } = buildDependencies({
      localFishRegulatoryAreaRepository: localFish.repository,
      syncStateRepository: createInMemorySyncStateRepository({
        env: new Date('2026-09-17T07:59:00Z'),
        fish: new Date('2026-09-17T07:59:00Z')
      }).repository
    })

    await syncRegulatoryAreas(dependencies, SEA_FRONTS, { forceRefresh: true })

    expect(localFish.replaceCallCount).toBe(1)
    expect(localFish.storedIds).toEqual([1])
  })
})
