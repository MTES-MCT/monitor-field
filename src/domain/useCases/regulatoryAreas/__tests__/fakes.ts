import type { EnvRegulatoryArea } from '@domain/entities/regulatoryAreas/EnvRegulatoryArea'
import type { FishRegulatoryArea } from '@domain/entities/regulatoryAreas/FishRegulatoryArea'
import { toRegulationType } from '@domain/entities/regulatoryAreas/FishRegulatoryArea'
import type { SyncedDataset, SyncStateRepository } from '@domain/repositories/SyncStateRepository'

type Identified = { id: number }

/**
 * `seaFrontOf` mirrors how each table discriminates its rows: the fish table stores the
 * prefixed `Reg. NAMO`, the env table the bare facade.
 */
function createInMemoryStore<T extends Identified>(seaFrontOf: (area: T) => string, seed: T[]) {
  const stored = new Map<number, T>(seed.map(area => [area.id, area]))
  let replaceCallCount = 0

  const repository = {
    countAll: async () => stored.size,

    deleteAll: async () => {
      stored.clear()
    },

    replaceForSeaFronts: async (seaFronts: string[], areas: T[]) => {
      replaceCallCount += 1
      const keptIds = new Set(areas.map(area => area.id))

      for (const [id, area] of stored) {
        if (!seaFronts.includes(seaFrontOf(area)) || !keptIds.has(id)) {
          stored.delete(id)
        }
      }

      for (const area of areas) {
        stored.set(area.id, area)
      }
    }
  }

  return {
    get replaceCallCount() {
      return replaceCallCount
    },
    repository,
    get storedIds() {
      return [...stored.keys()].sort((a, b) => a - b)
    }
  }
}

export function createInMemoryLocalFishRepository(seed: FishRegulatoryArea[] = []) {
  return createInMemoryStore<FishRegulatoryArea>(area => area.type.replace(/^Reg\. /, ''), seed)
}

export function createInMemoryLocalEnvRepository(seed: EnvRegulatoryArea[] = []) {
  return createInMemoryStore<EnvRegulatoryArea>(area => area.facade, seed)
}

export function createInMemorySyncStateRepository(seed: Partial<Record<SyncedDataset, Date>> = {}) {
  const syncedAt = new Map<SyncedDataset, Date>(Object.entries(seed) as [SyncedDataset, Date][])

  const repository: SyncStateRepository = {
    lastSyncedAt: (dataset: SyncedDataset) => syncedAt.get(dataset),
    markSyncedAt: (dataset: SyncedDataset, date: Date) => {
      syncedAt.set(dataset, date)
    }
  }

  return { repository, syncedAt }
}

export function buildFishArea(id: number, seaFront = 'NAMO'): FishRegulatoryArea {
  return {
    boundingBox: { maxLat: 49, maxLon: -3, minLat: 48, minLon: -4 },
    fishingPeriods: undefined,
    gears: undefined,
    generalRemarks: undefined,
    geometry: '{"type":"Polygon","coordinates":[]}',
    id,
    regulatoryReferences: undefined,
    species: undefined,
    theme: 'Thématique',
    type: toRegulationType(seaFront),
    zone: `Zone ${id}`
  }
}

export function buildEnvArea(id: number, facade = 'MEMN'): EnvRegulatoryArea {
  return {
    additionalRefReg: '',
    authorizationPeriods: '',
    boundingBox: { maxLat: 51, maxLon: 2, minLat: 49, minLon: 0 },
    date: '2026-01-01',
    dateFin: '',
    edition: undefined,
    facade,
    geometry: '{"type":"Polygon","coordinates":[]}',
    id,
    layerName: `Couche ${id}`,
    location: '',
    plan: '',
    polyName: `Polygone ${id}`,
    prohibitionPeriods: '',
    refReg: `Ref ${id}`,
    resume: '',
    themes: 'Thème',
    type: 'Type',
    url: `https://example.org/${id}`
  }
}
