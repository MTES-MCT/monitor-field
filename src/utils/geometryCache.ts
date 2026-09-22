import type { RawGeoJSONFeature } from '@/types/schemas'

/**
 * Bounded cache of parsed regulatory-area geometries, keyed by dataset + id.
 *
 * Overlapping searches re-read the same `geojson` column over and over, re-parsing the same
 * large geometry strings each time. This cache keeps the parsed object so repeat/panning
 * searches only pay the `JSON.parse` cost once. It is cleared on every sync, since replacing
 * the stored rows can change a geometry in place.
 */
const MAX_CACHED_GEOMETRIES = 256

const cache = new Map<string, RawGeoJSONFeature>()

export function getCachedGeometry(key: string): RawGeoJSONFeature | undefined {
  return cache.get(key)
}

export function cacheGeometry(key: string, feature: RawGeoJSONFeature): void {
  if (cache.has(key)) {
    // Re-insert to refresh recency.
    cache.delete(key)
  } else if (cache.size >= MAX_CACHED_GEOMETRIES) {
    // Evict the oldest entry (Map preserves insertion order).
    const oldestKey = cache.keys().next().value
    if (oldestKey !== undefined) {
      cache.delete(oldestKey)
    }
  }

  cache.set(key, feature)
}

export function clearGeometryCache(): void {
  cache.clear()
}
