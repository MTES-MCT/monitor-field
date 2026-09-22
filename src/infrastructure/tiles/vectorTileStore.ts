import { Directory, File, Paths } from 'expo-file-system'
import type { VectorTile } from '@utils/vectorTiles/generateVectorTiles'

export type RegulatoryDataset = 'env' | 'fish'

const TILES_ROOT = 'regulatory-tiles'

/** Zoom range tiles are generated for (the app never renders outside this). */
export const MIN_REGULATORY_TILE_ZOOM = 4
export const MAX_REGULATORY_TILE_ZOOM = 11

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
