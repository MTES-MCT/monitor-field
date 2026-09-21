import type { FishRegulatoryArea } from '@domain/entities/regulatoryAreas/FishRegulatoryArea'
import type { FishRegulatoryAreaRepository } from '@domain/repositories/FishRegulatoryAreaRepository'
import { syncFishRegulatoryAreas } from '../syncFishRegulatoryAreas'
import { buildFishArea, createInMemoryLocalFishRepository, createInMemorySyncStateRepository } from './fakes'

const NOW = new Date('2026-09-16T10:00:00Z')
const SIX_DAYS_AGO = new Date('2026-09-10T10:00:00Z')
const EIGHT_DAYS_AGO = new Date('2026-09-08T10:00:00Z')

function createRemoteRepository(areas: FishRegulatoryArea[]): FishRegulatoryAreaRepository {
  return { findBySeaFronts: async () => areas }
}

function setup({
  local = createInMemoryLocalFishRepository(),
  remote = createRemoteRepository([]),
  syncState = createInMemorySyncStateRepository()
} = {}) {
  return {
    dependencies: {
      fishRegulatoryAreaRepository: remote,
      localFishRegulatoryAreaRepository: local.repository,
      now: () => NOW,
      syncStateRepository: syncState.repository
    },
    local,
    syncState
  }
}

describe('syncFishRegulatoryAreas', () => {
  it('stores every area returned for the selected sea fronts', async () => {
    const { dependencies, local } = setup({
      remote: createRemoteRepository([buildFishArea(1), buildFishArea(2), buildFishArea(3)])
    })

    await syncFishRegulatoryAreas(dependencies, ['NAMO'])

    expect(local.storedIds).toEqual([1, 2, 3])
  })

  it('succeeds when run twice over the same areas', async () => {
    const { dependencies, local } = setup({ remote: createRemoteRepository([buildFishArea(1), buildFishArea(2)]) })

    await syncFishRegulatoryAreas(dependencies, ['NAMO'])
    await syncFishRegulatoryAreas(dependencies, ['NAMO'], true)

    expect(local.storedIds).toEqual([1, 2])
  })

  it('drops an area that is no longer published', async () => {
    const local = createInMemoryLocalFishRepository([buildFishArea(1), buildFishArea(2)])
    const { dependencies } = setup({ local, remote: createRemoteRepository([buildFishArea(1)]) })

    await syncFishRegulatoryAreas(dependencies, ['NAMO'], true)

    expect(local.storedIds).toEqual([1])
  })

  it('drops areas belonging to a sea front that is no longer selected', async () => {
    const local = createInMemoryLocalFishRepository([buildFishArea(1, 'NAMO'), buildFishArea(2, 'MEMN')])
    const { dependencies } = setup({ local, remote: createRemoteRepository([buildFishArea(1, 'NAMO')]) })

    await syncFishRegulatoryAreas(dependencies, ['NAMO'], true)

    expect(local.storedIds).toEqual([1])
  })

  it('clears the store and records the sync when no sea front is selected', async () => {
    const local = createInMemoryLocalFishRepository([buildFishArea(1)])
    const { dependencies, syncState } = setup({ local })

    await syncFishRegulatoryAreas(dependencies, [])

    expect(local.storedIds).toEqual([])
    expect(syncState.syncedAt.get('fish')).toEqual(NOW)
  })

  it('ignores blank sea fronts but still syncs the real ones', async () => {
    const { dependencies, local } = setup({ remote: createRemoteRepository([buildFishArea(1)]) })

    await syncFishRegulatoryAreas(dependencies, ['', 'NAMO'])

    expect(local.storedIds).toEqual([1])
  })

  describe('freshness', () => {
    it('skips the sync while local data is less than a week old', async () => {
      const local = createInMemoryLocalFishRepository([buildFishArea(1)])
      const { dependencies } = setup({
        local,
        remote: createRemoteRepository([buildFishArea(2)]),
        syncState: createInMemorySyncStateRepository({ fish: SIX_DAYS_AGO })
      })

      await syncFishRegulatoryAreas(dependencies, ['NAMO'])

      expect(local.replaceCallCount).toBe(0)
      expect(local.storedIds).toEqual([1])
    })

    it('syncs once local data is more than a week old', async () => {
      const local = createInMemoryLocalFishRepository([buildFishArea(1)])
      const { dependencies } = setup({
        local,
        remote: createRemoteRepository([buildFishArea(2)]),
        syncState: createInMemorySyncStateRepository({ fish: EIGHT_DAYS_AGO })
      })

      await syncFishRegulatoryAreas(dependencies, ['NAMO'])

      expect(local.storedIds).toEqual([2])
    })

    it('syncs fresh data anyway when forced', async () => {
      const local = createInMemoryLocalFishRepository([buildFishArea(1)])
      const { dependencies } = setup({
        local,
        remote: createRemoteRepository([buildFishArea(2)]),
        syncState: createInMemorySyncStateRepository({ fish: SIX_DAYS_AGO })
      })

      await syncFishRegulatoryAreas(dependencies, ['NAMO'], true)

      expect(local.storedIds).toEqual([2])
    })

    it('syncs when the store is empty however recent the last sync was', async () => {
      const { dependencies, local } = setup({
        remote: createRemoteRepository([buildFishArea(1)]),
        syncState: createInMemorySyncStateRepository({ fish: SIX_DAYS_AGO })
      })

      await syncFishRegulatoryAreas(dependencies, ['NAMO'])

      expect(local.storedIds).toEqual([1])
    })

    it('ignores the env timestamp when deciding whether fish is fresh', async () => {
      const local = createInMemoryLocalFishRepository([buildFishArea(1)])
      const { dependencies } = setup({
        local,
        remote: createRemoteRepository([buildFishArea(2)]),
        syncState: createInMemorySyncStateRepository({ env: SIX_DAYS_AGO })
      })

      await syncFishRegulatoryAreas(dependencies, ['NAMO'])

      expect(local.storedIds).toEqual([2])
    })
  })

  describe('failures', () => {
    it('propagates a remote failure without recording a sync', async () => {
      const { dependencies, syncState } = setup({
        remote: { findBySeaFronts: async () => Promise.reject(new Error('Unable to load: 400')) }
      })

      await expect(syncFishRegulatoryAreas(dependencies, ['NAMO'])).rejects.toThrow('Unable to load: 400')
      expect(syncState.syncedAt.get('fish')).toBeUndefined()
    })

    it('keeps stored areas when the remote returns nothing', async () => {
      const local = createInMemoryLocalFishRepository([buildFishArea(1)])
      const { dependencies, syncState } = setup({ local, syncState: createInMemorySyncStateRepository() })

      await syncFishRegulatoryAreas(dependencies, ['NAMO'], true)

      expect(local.storedIds).toEqual([1])
      expect(syncState.syncedAt.get('fish')).toBeUndefined()
    })
  })

  it('records the sync date on success', async () => {
    const { dependencies, syncState } = setup({ remote: createRemoteRepository([buildFishArea(1)]) })

    await syncFishRegulatoryAreas(dependencies, ['NAMO'])

    expect(syncState.syncedAt.get('fish')).toEqual(NOW)
  })
})
