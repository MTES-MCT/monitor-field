import { shouldSkipSync, SYNC_INTERVAL_IN_DAYS } from '../shouldSkipSync'

const NOW = new Date('2026-09-16T10:00:00Z')
const daysBefore = (days: number) => new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000)

const baseArgs = { forceRefresh: false, lastSyncedAt: daysBefore(1), now: NOW, storedAreaCount: 10 }

describe('shouldSkipSync', () => {
  it('skips while stored data is younger than the refresh interval', () => {
    expect(shouldSkipSync(baseArgs)).toBe(true)
  })

  it('syncs once stored data reaches the refresh interval', () => {
    expect(shouldSkipSync({ ...baseArgs, lastSyncedAt: daysBefore(SYNC_INTERVAL_IN_DAYS) })).toBe(false)
  })

  it('skips just under the refresh interval', () => {
    expect(shouldSkipSync({ ...baseArgs, lastSyncedAt: daysBefore(SYNC_INTERVAL_IN_DAYS - 0.01) })).toBe(true)
  })

  it('never skips when forced', () => {
    expect(shouldSkipSync({ ...baseArgs, forceRefresh: true })).toBe(false)
  })

  it('never skips when nothing is stored', () => {
    expect(shouldSkipSync({ ...baseArgs, storedAreaCount: 0 })).toBe(false)
  })

  it('never skips when the dataset was never synced', () => {
    expect(shouldSkipSync({ ...baseArgs, lastSyncedAt: undefined })).toBe(false)
  })

  it('never skips on an unparseable timestamp', () => {
    expect(shouldSkipSync({ ...baseArgs, lastSyncedAt: new Date('nonsense') })).toBe(false)
  })

  it('never skips when the recorded sync is in the future', () => {
    expect(shouldSkipSync({ ...baseArgs, lastSyncedAt: daysBefore(-1) })).toBe(false)
  })
})
