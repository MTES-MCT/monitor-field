import type { RegulatoryAreaDataset } from '@domain/entities/regulatoryAreas/RegulatoryAreaDataset'

export type SyncStateRepository = {
  lastSyncedAt: (dataset: RegulatoryAreaDataset) => Date | undefined
  markSyncedAt: (dataset: RegulatoryAreaDataset, syncedAt: Date) => void
}
