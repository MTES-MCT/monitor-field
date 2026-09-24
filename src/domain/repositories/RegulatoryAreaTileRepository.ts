import type { RegulatoryAreaDataset } from '@domain/entities/regulatoryAreas/RegulatoryAreaDataset'
import type { RegulatoryAreaGeometry } from '@domain/entities/regulatoryAreas/RegulatoryAreaGeometry'

export type RegulatoryAreaTileRepository = {
  replaceAll: (dataset: RegulatoryAreaDataset, geometries: RegulatoryAreaGeometry[]) => Promise<void>
  /** A `{z}/{x}/{y}` template, as map tile sources expect. */
  getUrlTemplate: (dataset: RegulatoryAreaDataset) => string
}
