export type SyncedDataset = 'fish' | 'env'

export type SyncStateRepository = {
  lastSyncedAt: (dataset: SyncedDataset) => Date | undefined
  markSyncedAt: (dataset: SyncedDataset, syncedAt: Date) => void
}
