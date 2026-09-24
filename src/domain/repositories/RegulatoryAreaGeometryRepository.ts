import type { RegulatoryAreaDataset } from '@domain/entities/regulatoryAreas/RegulatoryAreaDataset'
import type { RegulatoryAreaGeometry } from '@domain/entities/regulatoryAreas/RegulatoryAreaGeometry'

export type RegulatoryAreaGeometryRepository = {
  findAllByDataset: (dataset: RegulatoryAreaDataset) => Promise<RegulatoryAreaGeometry[]>
}
