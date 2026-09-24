import type { AppMode } from '@config/appModes'
import type { RegulatoryAreaDataset } from '@domain/entities/regulatoryAreas/RegulatoryAreaDataset'

export function toRegulatoryAreaDataset(mode: AppMode): RegulatoryAreaDataset {
  return mode === 'MONITORFISH' ? 'fish' : 'env'
}
