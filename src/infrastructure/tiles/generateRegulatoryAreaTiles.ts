import type { DB } from '@op-engineering/op-sqlite'
import { Colors } from '@constants/theme'
import { getDatabase } from '@database/db'
import { ENV_REGULATORY_AREAS_TABLE, FISH_REGULATORY_AREAS_TABLE } from '@database/db.schema'
import { storage } from '@storage'
import { parseGeoJSONFeature } from '@utils/parseGeoJSONFeature'
import { generateVectorTiles, type VectorTile } from '@utils/vectorTiles/generateVectorTiles'
import type { GeoJSONCollection, GeoJSONFeature } from '@/types/mapTypes'
import {
  MAX_REGULATORY_TILE_ZOOM,
  MAX_ZOOM_TILE_BUFFER,
  MAX_ZOOM_TILE_EXTENT,
  MIN_REGULATORY_TILE_ZOOM,
  OVERVIEW_TILE_BUFFER,
  OVERVIEW_TILE_EXTENT,
  OVERVIEW_TILE_TOLERANCE,
  clearVectorTiles,
  regulatoryTileGenerationConfig,
  regulatoryTilesDirectory,
  writeVectorTile,
  type RegulatoryDataset
} from './vectorTileStore'

const DEFAULT_FILL_COLOR = '#67A9CF'

type StoredGeometryRow = {
  id: number
  fillColor: string | null
  geojson?: string
}

/** The stored `fill_color` is a palette key; resolve it to a hex, mirroring the render path. */
function resolveFillColor(fillColor: string | null): string {
  if (!fillColor) {
    return DEFAULT_FILL_COLOR
  }

  return Colors.light[fillColor as keyof typeof Colors.light] ?? DEFAULT_FILL_COLOR
}

/** Incremental FNV-1a hash over the geometry — enough to skip regeneration when nothing changed. */
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

function cacheKey(dataset: RegulatoryDataset): string {
  return `regulatory-tiles:${dataset}:${regulatoryTileGenerationConfig()}:hash`
}

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

async function regenerateDatasetTiles(db: DB, dataset: RegulatoryDataset): Promise<void> {
  const stepStartedAt = Date.now()
  // eslint-disable-next-line no-console
  console.log(`[tiles] ${dataset}: reading geometry from SQLite…`)

  const table = dataset === 'env' ? ENV_REGULATORY_AREAS_TABLE : FISH_REGULATORY_AREAS_TABLE
  const result = await db.execute(`SELECT id, fill_color AS fillColor, geojson FROM ${table}`)
  const rows = result.rows as StoredGeometryRow[]

  // eslint-disable-next-line no-console
  console.log(`[tiles] ${dataset}: read ${rows.length} rows (${elapsedMs(stepStartedAt)}ms)`)

  const hash = hashStrings(rows.flatMap(row => [String(row.id), ':', row.fillColor ?? '', ':', row.geojson ?? '', ';']))

  if (storage.getString(cacheKey(dataset)) === hash) {
    // eslint-disable-next-line no-console
    console.log(`[tiles] ${dataset}: unchanged, skipped (${elapsedMs(stepStartedAt)}ms)`)
    return
  }

  // eslint-disable-next-line no-console
  console.log(`[tiles] ${dataset}: data changed, parsing ${rows.length} features…`)
  const features: GeoJSONFeature[] = []

  for (const row of rows) {
    const feature = parseGeoJSONFeature(row.geojson)

    if (!feature) {
      continue
    }

    features.push({
      ...feature,
      properties: { id: row.id, fillColor: resolveFillColor(row.fillColor) }
    } as GeoJSONFeature)
  }

  // eslint-disable-next-line no-console
  console.log(`[tiles] ${dataset}: parsed ${features.length} features (${elapsedMs(stepStartedAt)}ms)`)

  const collection: GeoJSONCollection = { type: 'FeatureCollection', features }
  const directory = regulatoryTilesDirectory(dataset)
  clearVectorTiles(directory)

  // eslint-disable-next-line no-console
  console.log(
    `[tiles] ${dataset}: generating MVT tiles z${MIN_REGULATORY_TILE_ZOOM}–z${MAX_REGULATORY_TILE_ZOOM}… (this is the slow part)`
  )

  const generationStartedAt = Date.now()
  const PROGRESS_INTERVAL = 500
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

  // Overview levels (z0..zMax-1): default extent/tolerance, simplified. `detailZoom` is pushed up
  // to the true detail level (zMax) so geojson-vt doesn't force `tolerance = 0` on zMax-1 — the
  // deepest level we actually emit here — which would otherwise write it out un-simplified. The
  // index is still only built down to `maxZoom`, so the full-precision zMax tiles are never built here.
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
    writeTile,
    reportTotal
  )

  // Finest level only (zMax): full precision — extent 2^21, no simplification.
  generateVectorTiles(
    collection,
    {
      buffer: MAX_ZOOM_TILE_BUFFER,
      extent: MAX_ZOOM_TILE_EXTENT,
      maxZoom: MAX_REGULATORY_TILE_ZOOM,
      minZoom: MAX_REGULATORY_TILE_ZOOM,
      tolerance: 0
    },
    writeTile,
    reportTotal
  )

  storage.set(cacheKey(dataset), hash)

  // eslint-disable-next-line no-console
  console.log(`[tiles] ${dataset}: wrote ${count} tiles in ${elapsedMs(generationStartedAt)}ms -> ${directory.uri}`)
}

/**
 * Rebuilds the on-disk MVT pyramid for both datasets. Streams tiles to disk one at a time (so the
 * full pyramid is never held in memory) and skips a dataset whose geometry hash is unchanged.
 */
export async function regenerateRegulatoryAreaTiles(): Promise<void> {
  const overallStartedAt = Date.now()
  // eslint-disable-next-line no-console
  console.log('[tiles] tile generation started')

  const db = await getDatabase()

  for (const dataset of ['env', 'fish'] as const) {
    await regenerateDatasetTiles(db, dataset)
  }

  const envBytes = regulatoryTilesDirectory('env').size ?? 0
  const fishBytes = regulatoryTilesDirectory('fish').size ?? 0

  // eslint-disable-next-line no-console
  console.log(
    `[tiles] disk usage — env: ${formatBytes(envBytes)}, fish: ${formatBytes(fishBytes)}, total: ${formatBytes(envBytes + fishBytes)}`
  )

  // eslint-disable-next-line no-console
  console.log(`[tiles] tile generation finished (${elapsedMs(overallStartedAt)}ms)`)
}
