import type { RegulatoryAreaDataset } from '@domain/entities/regulatoryAreas/RegulatoryAreaDataset'
import type { RegulatoryAreaGeometryRepository } from '@domain/repositories/RegulatoryAreaGeometryRepository'
import type { RegulatoryAreaTileRepository } from '@domain/repositories/RegulatoryAreaTileRepository'

export type RegenerateRegulatoryAreaTilesDependencies = {
  regulatoryAreaGeometryRepository: RegulatoryAreaGeometryRepository
  regulatoryAreaTileRepository: RegulatoryAreaTileRepository
}

const DATASETS: RegulatoryAreaDataset[] = ['env', 'fish']

export async function regenerateRegulatoryAreaTiles(
  { regulatoryAreaGeometryRepository, regulatoryAreaTileRepository }: RegenerateRegulatoryAreaTilesDependencies,
  changedDatasets: RegulatoryAreaDataset[]
): Promise<void> {
  // Sequential: generating tiles is CPU and memory heavy.
  for (const dataset of DATASETS) {
    const dataChanged = changedDatasets.includes(dataset)

    // Rebuild when the data changed, or when the tiles were generated with an older fingerprint
    // (e.g. tile parameters changed between app versions). Otherwise skip: re-reading and
    // re-hashing every geometry on each launch is what made startup slow.
    if (!dataChanged && regulatoryAreaTileRepository.isGenerationCurrent(dataset)) {
      continue
    }

    const geometries = await regulatoryAreaGeometryRepository.findAllByDataset(dataset)

    await regulatoryAreaTileRepository.replaceAll(dataset, geometries)
  }
}
