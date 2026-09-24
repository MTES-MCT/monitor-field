import type { EnvRegulatoryArea } from '@domain/entities/regulatoryAreas/EnvRegulatoryArea'
import type { FishRegulatoryArea } from '@domain/entities/regulatoryAreas/FishRegulatoryArea'
import { toRegulationType } from '@domain/entities/regulatoryAreas/FishRegulatoryArea'
import type { RegulatoryAreaDataset } from '@domain/entities/regulatoryAreas/RegulatoryAreaDataset'
import type { RegulatoryAreaGeometry } from '@domain/entities/regulatoryAreas/RegulatoryAreaGeometry'
import type {
  EnvRegulatoryAreaSummary,
  FishRegulatoryAreaSummary
} from '@domain/entities/regulatoryAreas/RegulatoryAreaSummary'
import type { RegulatoryAreaGeometryRepository } from '@domain/repositories/RegulatoryAreaGeometryRepository'
import type { RegulatoryAreaTileRepository } from '@domain/repositories/RegulatoryAreaTileRepository'
import type { EnvRegulatoryAreaSummaryRepository } from '@domain/repositories/EnvRegulatoryAreaSummaryRepository'
import type { FishRegulatoryAreaSummaryRepository } from '@domain/repositories/FishRegulatoryAreaSummaryRepository'
import type { SyncStateRepository } from '@domain/repositories/SyncStateRepository'
import type { BoundingBox } from '@/types/mapTypes'

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

export function createInMemorySyncStateRepository(seed: Partial<Record<RegulatoryAreaDataset, Date>> = {}) {
  const syncedAt = new Map<RegulatoryAreaDataset, Date>(Object.entries(seed) as [RegulatoryAreaDataset, Date][])

  const repository: SyncStateRepository = {
    lastSyncedAt: (dataset: RegulatoryAreaDataset) => syncedAt.get(dataset),
    markSyncedAt: (dataset: RegulatoryAreaDataset, date: Date) => {
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

function overlaps(a: BoundingBox, b: BoundingBox): boolean {
  return a.maxLon >= b.minLon && a.minLon <= b.maxLon && a.maxLat >= b.minLat && a.minLat <= b.maxLat
}

function createInMemorySummaryRepository<T extends Identified & { bbox: BoundingBox }>(areas: T[]) {
  return {
    findAll: async () => [...areas],
    findByIds: async (ids: number[]) => areas.filter(area => ids.includes(area.id)),
    findOverlapping: async (boundingBox: BoundingBox) => areas.filter(area => overlaps(area.bbox, boundingBox))
  }
}

export function createInMemoryFishSummaryRepository(
  areas: FishRegulatoryAreaSummary[] = []
): FishRegulatoryAreaSummaryRepository {
  return createInMemorySummaryRepository(areas)
}

export function createInMemoryEnvSummaryRepository(
  areas: EnvRegulatoryAreaSummary[] = []
): EnvRegulatoryAreaSummaryRepository {
  return createInMemorySummaryRepository(areas)
}

export function createInMemoryGeometryRepository(
  geometries: Partial<Record<RegulatoryAreaDataset, RegulatoryAreaGeometry[]>>
): RegulatoryAreaGeometryRepository {
  return { findAllByDataset: async (dataset: RegulatoryAreaDataset) => geometries[dataset] ?? [] }
}

export function createInMemoryTileRepository() {
  const tiles = new Map<RegulatoryAreaDataset, RegulatoryAreaGeometry[]>()
  const replacedDatasets: RegulatoryAreaDataset[] = []

  const repository: RegulatoryAreaTileRepository = {
    getUrlTemplate: (dataset: RegulatoryAreaDataset) => `memory://${dataset}/{z}/{x}/{y}.pbf`,
    isGenerationCurrent: (dataset: RegulatoryAreaDataset) => tiles.has(dataset),
    replaceAll: async (dataset: RegulatoryAreaDataset, geometries: RegulatoryAreaGeometry[]) => {
      replacedDatasets.push(dataset)
      tiles.set(dataset, geometries)
    }
  }

  return { replacedDatasets, repository, tiles }
}

const DEFAULT_STORED_BBOX: BoundingBox = { maxLat: 49, maxLon: -3, minLat: 48, minLon: -4 }

export function buildFishAreaSummary(
  id: number,
  overrides: Partial<FishRegulatoryAreaSummary> = {}
): FishRegulatoryAreaSummary {
  return {
    bbox: DEFAULT_STORED_BBOX,
    colorKey: 'yaleBlue',
    fishingPeriods: null,
    gears: null,
    generalRemarks: null,
    id,
    regulatoryReferences: null,
    species: null,
    theme: 'Thématique',
    totalByGroup: 1,
    type: toRegulationType('NAMO'),
    zone: `Zone ${id}`,
    ...overrides
  }
}

export function buildEnvAreaSummary(
  id: number,
  overrides: Partial<EnvRegulatoryAreaSummary> = {}
): EnvRegulatoryAreaSummary {
  return {
    additionalRefReg: '',
    authorizationPeriods: '',
    bbox: DEFAULT_STORED_BBOX,
    colorKey: 'opal',
    date: '2026-01-01',
    dateFin: '',
    edition: null,
    facade: 'MEMN',
    id,
    layerName: `Couche ${id}`,
    location: '',
    plan: null,
    polyName: `Polygone ${id}`,
    prohibitionPeriods: '',
    refReg: `Ref ${id}`,
    resume: '',
    themes: 'Thème',
    totalByGroup: 1,
    type: 'Type',
    url: `https://example.org/${id}`,
    ...overrides
  }
}
