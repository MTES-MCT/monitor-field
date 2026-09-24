import type { RegulatoryAreaDataset } from '@domain/entities/regulatoryAreas/RegulatoryAreaDataset'
import type { RegulatoryAreaGeometry } from '@domain/entities/regulatoryAreas/RegulatoryAreaGeometry'

export type RegulatoryAreaTileRepository = {
  replaceAll: (dataset: RegulatoryAreaDataset, geometries: RegulatoryAreaGeometry[]) => Promise<void>
  /** A `{z}/{x}/{y}` template, as map tile sources expect. */
  getUrlTemplate: (dataset: RegulatoryAreaDataset) => string
  /**
   * True when tiles for `dataset` were generated with the current generation fingerprint.
   * Cheap to check (no geometry read): lets the sync skip rebuilding when neither the data nor
   * the tile parameters changed.
   */
  isGenerationCurrent: (dataset: RegulatoryAreaDataset) => boolean
}
