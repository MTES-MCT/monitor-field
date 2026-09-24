import type { EnvRegulatoryArea } from '@domain/entities/regulatoryAreas/EnvRegulatoryArea'
import type { EnvRegulatoryAreaRepository } from '@domain/repositories/EnvRegulatoryAreaRepository'
import { syncEnvRegulatoryAreas } from '../syncEnvRegulatoryAreas'
import { buildEnvArea, createInMemoryLocalEnvRepository, createInMemorySyncStateRepository } from './fakes'

const NOW = new Date('2026-09-16T10:00:00Z')
const SIX_DAYS_AGO = new Date('2026-09-10T10:00:00Z')

function createRemoteRepository(areas: EnvRegulatoryArea[]): EnvRegulatoryAreaRepository {
  return { findBySeaFronts: async () => areas }
}

function setup({
  local = createInMemoryLocalEnvRepository(),
  remote = createRemoteRepository([]),
  syncState = createInMemorySyncStateRepository()
} = {}) {
  return {
    dependencies: {
      envRegulatoryAreaRepository: remote,
      localEnvRegulatoryAreaRepository: local.repository,
      now: () => NOW,
      syncStateRepository: syncState.repository
    },
    local,
    syncState
  }
}

describe('syncEnvRegulatoryAreas', () => {
  it('stores every area returned for the selected sea fronts', async () => {
    const { dependencies, local } = setup({
      remote: createRemoteRepository([buildEnvArea(1), buildEnvArea(2)])
    })

    expect(await syncEnvRegulatoryAreas(dependencies, ['MEMN'])).toBe(true)
    expect(local.storedIds).toEqual([1, 2])
  })

  it('succeeds when run twice over the same areas', async () => {
    const { dependencies, local } = setup({ remote: createRemoteRepository([buildEnvArea(1)]) })

    await syncEnvRegulatoryAreas(dependencies, ['MEMN'])
    await syncEnvRegulatoryAreas(dependencies, ['MEMN'], true)

    expect(local.storedIds).toEqual([1])
  })

  it('drops an area that is no longer published', async () => {
    const local = createInMemoryLocalEnvRepository([buildEnvArea(1), buildEnvArea(2)])
    const { dependencies } = setup({ local, remote: createRemoteRepository([buildEnvArea(1)]) })

    await syncEnvRegulatoryAreas(dependencies, ['MEMN'], true)

    expect(local.storedIds).toEqual([1])
  })

  it('drops areas belonging to a facade that is no longer selected', async () => {
    const local = createInMemoryLocalEnvRepository([buildEnvArea(1, 'MEMN'), buildEnvArea(2, 'NAMO')])
    const { dependencies } = setup({ local, remote: createRemoteRepository([buildEnvArea(1, 'MEMN')]) })

    await syncEnvRegulatoryAreas(dependencies, ['MEMN'], true)

    expect(local.storedIds).toEqual([1])
  })

  it('clears the store and records the sync when no sea front is selected', async () => {
    const local = createInMemoryLocalEnvRepository([buildEnvArea(1)])
    const { dependencies, syncState } = setup({ local })

    expect(await syncEnvRegulatoryAreas(dependencies, [])).toBe(true)
    expect(local.storedIds).toEqual([])
    expect(syncState.syncedAt.get('env')).toEqual(NOW)
  })

  it('skips the sync while local data is less than a week old', async () => {
    const local = createInMemoryLocalEnvRepository([buildEnvArea(1)])
    const { dependencies } = setup({
      local,
      remote: createRemoteRepository([buildEnvArea(2)]),
      syncState: createInMemorySyncStateRepository({ env: SIX_DAYS_AGO })
    })

    expect(await syncEnvRegulatoryAreas(dependencies, ['MEMN'])).toBe(false)
    expect(local.replaceCallCount).toBe(0)
  })

  it('ignores the fish timestamp when deciding whether env is fresh', async () => {
    const local = createInMemoryLocalEnvRepository([buildEnvArea(1)])
    const { dependencies } = setup({
      local,
      remote: createRemoteRepository([buildEnvArea(2)]),
      syncState: createInMemorySyncStateRepository({ fish: SIX_DAYS_AGO })
    })

    await syncEnvRegulatoryAreas(dependencies, ['MEMN'])

    expect(local.storedIds).toEqual([2])
  })

  it('propagates a remote failure without recording a sync', async () => {
    const { dependencies, syncState } = setup({
      remote: { findBySeaFronts: async () => Promise.reject(new Error('Unable to load: 500')) }
    })

    await expect(syncEnvRegulatoryAreas(dependencies, ['MEMN'])).rejects.toThrow('Unable to load: 500')
    expect(syncState.syncedAt.get('env')).toBeUndefined()
  })

  it('keeps stored areas when the remote returns nothing', async () => {
    const local = createInMemoryLocalEnvRepository([buildEnvArea(1)])
    const { dependencies } = setup({ local })

    expect(await syncEnvRegulatoryAreas(dependencies, ['MEMN'], true)).toBe(false)
    expect(local.storedIds).toEqual([1])
  })
})
