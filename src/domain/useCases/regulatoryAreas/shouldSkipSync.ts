/** Stated to the user on the Settings screen. */
export const SYNC_INTERVAL_IN_DAYS = 7

type ShouldSkipSyncArgs = {
  forceRefresh: boolean
  lastSyncedAt: Date | undefined
  now: Date
  storedAreaCount: number
}

export function shouldSkipSync({ forceRefresh, lastSyncedAt, now, storedAreaCount }: ShouldSkipSyncArgs): boolean {
  if (forceRefresh || storedAreaCount === 0 || !lastSyncedAt) {
    return false
  }

  const ageInMs = now.getTime() - lastSyncedAt.getTime()
  if (Number.isNaN(ageInMs)) {
    return false
  }

  return ageInMs >= 0 && ageInMs < SYNC_INTERVAL_IN_DAYS * 24 * 60 * 60 * 1000
}
