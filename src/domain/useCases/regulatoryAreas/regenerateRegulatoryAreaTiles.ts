import type { RegulatoryAreaDataset } from '@domain/entities/regulatoryAreas/RegulatoryAreaDataset'
import type { RegulatoryAreaGeometryRepository } from '@domain/repositories/RegulatoryAreaGeometryRepository'
import type { RegulatoryAreaTileRepository } from '@domain/repositories/RegulatoryAreaTileRepository'

export type RegenerateRegulatoryAreaTilesDependencies = {
  regulatoryAreaGeometryRepository: RegulatoryAreaGeometryRepository
  regulatoryAreaTileRepository: RegulatoryAreaTileRepository
}

const DATASETS: RegulatoryAreaDataset[] = ['env', 'fish']

export async function regenerateRegulatoryAreaTiles({
  regulatoryAreaGeometryRepository,
  regulatoryAreaTileRepository
}: RegenerateRegulatoryAreaTilesDependencies): Promise<void> {
  // Sequential: generating tiles is CPU and memory heavy.
  for (const dataset of DATASETS) {
    const geometries = await regulatoryAreaGeometryRepository.findAllByDataset(dataset)

    await regulatoryAreaTileRepository.replaceAll(dataset, geometries)
  }
}
