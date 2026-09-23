import { Directory, File, Paths } from 'expo-file-system'
import type { VectorTile } from '@utils/vectorTiles/generateVectorTiles'

export type RegulatoryDataset = 'env' | 'fish'

const TILES_ROOT = 'regulatory-tiles'

/** Zoom range tiles are generated for (the app never renders outside this). */
export const MIN_REGULATORY_TILE_ZOOM = 0
export const MAX_REGULATORY_TILE_ZOOM = 11

/** Overview levels (z0..zMax-1) are Douglas-Peucker simplified; these are their tile parameters. */
export const OVERVIEW_TILE_EXTENT = 4096
export const OVERVIEW_TILE_TOLERANCE = 3
export const OVERVIEW_TILE_BUFFER = 64

/** Finest level (zMax) is generated at source precision (no simplification). */
export const MAX_ZOOM_TILE_EXTENT = 2 ** 21
/**
 * buffer scales with extent (2^21 / 64) to preserve the ~1.5% overlap: at this extent the default
 * buffer (64 units) is negligible and tile seams become visible.
 */
export const MAX_ZOOM_TILE_BUFFER = 32768

/**
 * Fingerprint of every parameter that changes the generated tile bytes. Baked into the generation
 * cache key so tiles are always rebuilt when any of these change.
 */
export function regulatoryTileGenerationConfig(): string {
  return [
    `z${MIN_REGULATORY_TILE_ZOOM}-${MAX_REGULATORY_TILE_ZOOM}`,
    `ext${OVERVIEW_TILE_EXTENT}`,
    `sim${OVERVIEW_TILE_TOLERANCE}`,
    `buf${OVERVIEW_TILE_BUFFER}`,
    `maxExt${MAX_ZOOM_TILE_EXTENT}`,
    `maxBuf${MAX_ZOOM_TILE_BUFFER}`
  ].join(':')
}

/** MVT layer name emitted into every tile (used as `source-layer` in the style). */
export const REGULATORY_AREAS_TILE_LAYER = 'regulatory-areas'

/** Directory that holds the `.pbf` tiles for one dataset. */
export function regulatoryTilesDirectory(dataset: RegulatoryDataset): Directory {
  return new Directory(Paths.document, TILES_ROOT, dataset)
}

/** `file://` URL template consumed by `VectorSource`'s `tiles` prop. */
export function tileUrlTemplate(directory: Directory): string {
  return `${directory.uri}/{z}/{x}/{y}.pbf`
}

/** Removes any previously generated tiles for `directory`. */
export function clearVectorTiles(directory: Directory): void {
  if (directory.exists) {
    directory.delete()
  }
}

/** Writes a single tile to disk (called per-tile so the pyramid is streamed, never buffered). */
export function writeVectorTile(directory: Directory, tile: VectorTile): void {
  const file = new File(directory, String(tile.z), String(tile.x), `${tile.y}.pbf`)
  file.create({ intermediates: true, overwrite: true })
  file.write(tile.data)
}
