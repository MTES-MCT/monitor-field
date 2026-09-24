import { Directory, File, Paths } from 'expo-file-system'
import type { RegulatoryAreaDataset } from '@domain/entities/regulatoryAreas/RegulatoryAreaDataset'
import type { VectorTile } from '@utils/vectorTiles/generateVectorTiles'

const TILES_ROOT = 'regulatory-tiles'

export function getRegulatoryTilesDirectory(dataset: RegulatoryAreaDataset): Directory {
  return new Directory(Paths.document, TILES_ROOT, dataset)
}

export function buildTileUrlTemplate(directory: Directory): string {
  return `${directory.uri}/{z}/{x}/{y}.pbf`
}

export function deleteVectorTiles(directory: Directory): void {
  if (directory.exists) {
    directory.delete()
  }
}

/** One tile at a time, so the whole pyramid is never held in memory. */
export function writeVectorTile(directory: Directory, tile: VectorTile): void {
  const file = new File(directory, String(tile.z), String(tile.x), `${tile.y}.pbf`)
  file.create({ intermediates: true, overwrite: true })
  file.write(tile.data)
}
