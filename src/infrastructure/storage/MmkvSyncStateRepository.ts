import dayjs from 'dayjs'
import { storage } from '@storage'
import type { RegulatoryAreaDataset } from '@domain/entities/regulatoryAreas/RegulatoryAreaDataset'
import type { SyncStateRepository } from '@domain/repositories/SyncStateRepository'

const DATE_FORMAT = 'YYYY-MM-DD HH:mm'

// Per-dataset keys: fish and env sync concurrently, so a single shared key let whichever
// finished first satisfy the other's freshness check.
const STORAGE_KEYS: Record<RegulatoryAreaDataset, string> = {
  env: 'env-regulatory-areas-last-update',
  fish: 'fish-regulatory-areas-last-update'
}

export function createMmkvSyncStateRepository(): SyncStateRepository {
  return {
    lastSyncedAt: (dataset: RegulatoryAreaDataset) => {
      const stored = storage.getString(STORAGE_KEYS[dataset])

      if (!stored) {
        return undefined
      }

      const parsed = dayjs(stored)

      return parsed.isValid() ? parsed.toDate() : undefined
    },

    markSyncedAt: (dataset: RegulatoryAreaDataset, syncedAt: Date) => {
      storage.set(STORAGE_KEYS[dataset], dayjs(syncedAt).format(DATE_FORMAT))
    }
  }
}
