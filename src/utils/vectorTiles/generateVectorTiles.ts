import geojsonvt from 'geojson-vt'
import { fromGeojsonVt } from 'vt-pbf'
import type { GeoJSONCollection } from '@/types/mapTypes'

export type VectorTile = {
  z: number
  x: number
  y: number
  /** Uncompressed MVT (`.pbf`) payload for this tile. */
  data: Uint8Array
}

export type GenerateVectorTilesOptions = {
  /** MVT layer name emitted into every tile. */
  layerName?: string
  /** Lowest zoom level to keep (inclusive). */
  minZoom?: number
  /** Highest zoom level to generate tiles for (inclusive). */
  maxZoom?: number
  /** MVT tile extent (coordinate resolution per tile). */
  extent?: number
  /** Simplification tolerance in extent units (higher = more aggressive). */
  tolerance?: number
  /** Tile buffer in extent units. */
  buffer?: number
  /** Feature property promoted to the MVT feature `id` (needed for tap detection). */
  promoteId?: string | null
}

const DEFAULT_LAYER_NAME = 'regulatory-areas'

/**
 * Converts a GeoJSON FeatureCollection into a set of per-zoom MVT tiles.
 *
 * geojson-vt performs the per-zoom Douglas-Peucker simplification, which is what replaces the
 * discrete "coarse / fine" LOD columns: every zoom gets exactly the detail it can render.
 */
export function generateVectorTiles(
  collection: GeoJSONCollection,
  options: GenerateVectorTilesOptions = {},
  onTile?: (tile: VectorTile) => void,
  onTotal?: (total: number) => void
): VectorTile[] {
  const {
    layerName = DEFAULT_LAYER_NAME,
    minZoom = 0,
    maxZoom = 14,
    extent = 4096,
    tolerance = 3,
    buffer = 64,
    promoteId = 'id'
  } = options

  // `indexMaxPoints: 0` forces the index to split every populated tile all the way down to
  // `maxZoom`, instead of stopping early when a tile is "simple enough". Without it, the tile
  // index would only reach `indexMaxZoom` (5 by default) and `tileCoords` would miss the
  // higher-zoom tiles we need for an offline pyramid.
  const index = new geojsonvt(collection as unknown as ConstructorParameters<typeof geojsonvt>[0], {
    maxZoom,
    indexMaxZoom: maxZoom,
    indexMaxPoints: 0,
    extent,
    tolerance,
    buffer,
    promoteId
  })

  // Report the number of populated tiles before writing, so callers can show progress.
  if (onTotal) {
    let total = 0
    for (const { z, x, y } of index.tileCoords) {
      if (z < minZoom) {
        continue
      }
      const tile = index.getTileRaw(z, x, y)
      if (tile && tile.features.length > 0) {
        total += 1
      }
    }
    onTotal(total)
  }

  const tiles: VectorTile[] = []

  for (const { z, x, y } of index.tileCoords) {
    if (z < minZoom) {
      continue
    }

    const tile = index.getTile(z, x, y)

    if (!tile || tile.features.length === 0) {
      continue
    }

    const vectorTile: VectorTile = {
      z,
      x,
      y,
      data: fromGeojsonVt({ [layerName]: tile }, { extent, version: 2 })
    }

    if (onTile) {
      // Stream each tile to the caller so the whole pyramid is never held in memory.
      onTile(vectorTile)
    } else {
      tiles.push(vectorTile)
    }
  }

  return tiles
}
