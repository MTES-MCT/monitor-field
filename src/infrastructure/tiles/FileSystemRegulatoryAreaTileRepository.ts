import {
  MAX_REGULATORY_TILE_ZOOM,
  MAX_ZOOM_TILE_BUFFER,
  MAX_ZOOM_TILE_EXTENT,
  MIN_REGULATORY_TILE_ZOOM,
  OVERVIEW_TILE_BUFFER,
  OVERVIEW_TILE_EXTENT,
  OVERVIEW_TILE_TOLERANCE,
  buildTileGenerationFingerprint
} from '@constants/regulatoryAreaTiles'
import type { RegulatoryAreaDataset } from '@domain/entities/regulatoryAreas/RegulatoryAreaDataset'
import type { RegulatoryAreaGeometry } from '@domain/entities/regulatoryAreas/RegulatoryAreaGeometry'
import type { RegulatoryAreaTileRepository } from '@domain/repositories/RegulatoryAreaTileRepository'
import { storage } from '@storage'
import { parseGeoJSONFeature } from '@utils/parseGeoJSONFeature'
import { generateVectorTiles, type VectorTile } from '@utils/vectorTiles/generateVectorTiles'
import type { GeoJSONCollection, GeoJSONFeature } from '@/types/mapTypes'
import {
  buildTileUrlTemplate,
  deleteVectorTiles,
  getRegulatoryTilesDirectory,
  writeVectorTile
} from './vectorTileStore'

const PROGRESS_INTERVAL = 500

function elapsedMs(since: number): number {
  return Date.now() - since
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 ** 2) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`
}

/** FNV-1a: cheap enough to skip regenerating tiles when nothing changed. */
function hashStrings(strings: string[]): string {
  let hash = 2166136261

  for (const string of strings) {
    for (let i = 0; i < string.length; i += 1) {
      hash ^= string.charCodeAt(i)
      hash = Math.imul(hash, 16777619)
    }
  }

  return (hash >>> 0).toString(36)
}

function hashGeometries(geometries: RegulatoryAreaGeometry[]): string {
  return hashStrings(
    geometries.flatMap(({ colorKey, geometry, id }) => [String(id), ':', colorKey ?? '', ':', geometry ?? '', ';'])
  )
}

function buildHashStorageKey(dataset: RegulatoryAreaDataset): string {
  return `regulatory-tiles:${dataset}:${buildTileGenerationFingerprint()}:hash`
}

function toFeatureCollection(geometries: RegulatoryAreaGeometry[]): GeoJSONCollection {
  const features: GeoJSONFeature[] = []

  for (const { colorKey, geometry, id } of geometries) {
    const feature = parseGeoJSONFeature(geometry)

    if (feature) {
      features.push({ ...feature, properties: { colorKey, id } } as GeoJSONFeature)
    }
  }

  return { features, type: 'FeatureCollection' }
}

function generateTiles(
  collection: GeoJSONCollection,
  onTile: (tile: VectorTile) => void,
  onTotal: (total: number) => void
): void {
  // `detailZoom` is pushed to the max zoom so geojson-vt doesn't force `tolerance = 0` on the
  // deepest overview level, which would then be written un-simplified.
  generateVectorTiles(
    collection,
    {
      buffer: OVERVIEW_TILE_BUFFER,
      detailZoom: MAX_REGULATORY_TILE_ZOOM,
      extent: OVERVIEW_TILE_EXTENT,
      maxZoom: MAX_REGULATORY_TILE_ZOOM - 1,
      minZoom: MIN_REGULATORY_TILE_ZOOM,
      tolerance: OVERVIEW_TILE_TOLERANCE
    },
    onTile,
    onTotal
  )

  generateVectorTiles(
    collection,
    {
      buffer: MAX_ZOOM_TILE_BUFFER,
      extent: MAX_ZOOM_TILE_EXTENT,
      maxZoom: MAX_REGULATORY_TILE_ZOOM,
      minZoom: MAX_REGULATORY_TILE_ZOOM,
      tolerance: 0
    },
    onTile,
    onTotal
  )
}

export function createFileSystemRegulatoryAreaTileRepository(): RegulatoryAreaTileRepository {
  return {
    getUrlTemplate: (dataset: RegulatoryAreaDataset) => buildTileUrlTemplate(getRegulatoryTilesDirectory(dataset)),

    replaceAll: async (dataset: RegulatoryAreaDataset, geometries: RegulatoryAreaGeometry[]) => {
      const startedAt = Date.now()
      const hash = hashGeometries(geometries)

      if (storage.getString(buildHashStorageKey(dataset)) === hash) {
        // eslint-disable-next-line no-console
        console.log(`[tiles] ${dataset}: unchanged, skipped (${elapsedMs(startedAt)}ms)`)
        return
      }

      // eslint-disable-next-line no-console
      console.log(`[tiles] ${dataset}: data changed, parsing ${geometries.length} features…`)
      const collection = toFeatureCollection(geometries)
      // eslint-disable-next-line no-console
      console.log(`[tiles] ${dataset}: parsed ${collection.features.length} features (${elapsedMs(startedAt)}ms)`)

      const directory = getRegulatoryTilesDirectory(dataset)
      deleteVectorTiles(directory)

      // eslint-disable-next-line no-console
      console.log(
        `[tiles] ${dataset}: generating MVT tiles z${MIN_REGULATORY_TILE_ZOOM}–z${MAX_REGULATORY_TILE_ZOOM}… (this is the slow part)`
      )

      const generationStartedAt = Date.now()
      let count = 0
      let total = 0

      const writeTile = (tile: VectorTile) => {
        writeVectorTile(directory, tile)
        count += 1

        if (count % PROGRESS_INTERVAL === 0 || count === total) {
          const percent = total > 0 ? ((count / total) * 100).toFixed(1) : '?'
          // eslint-disable-next-line no-console
          console.log(`[tiles] ${dataset}: ${count}/${total} (${percent}%)`)
        }
      }

      const reportTotal = (reportedTotal: number) => {
        total += reportedTotal
        // eslint-disable-next-line no-console
        console.log(`[tiles] ${dataset}: +${reportedTotal} tiles (total ${total})`)
      }

      generateTiles(collection, writeTile, reportTotal)

      storage.set(buildHashStorageKey(dataset), hash)

      // eslint-disable-next-line no-console
      console.log(
        `[tiles] ${dataset}: wrote ${count} tiles (${formatBytes(directory.size ?? 0)}) in ${elapsedMs(generationStartedAt)}ms -> ${directory.uri}`
      )
    }
  }
}
