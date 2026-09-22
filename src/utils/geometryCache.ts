import type { RawGeoJSONFeature } from '@/types/schemas'
import { parseStoredFeature } from './parseGeoJSONFeature'

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

function getCachedGeometry(key: string): RawGeoJSONFeature | undefined {
  return cache.get(key)
}

function cacheGeometry(key: string, feature: RawGeoJSONFeature): void {
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

/**
 * Returns the parsed feature for an area, resolving it from the cache or, on a miss, parsing
 * and caching the stored geometry. This is the shared "cache lookup → parse → cache" step used
 * by both the search use cases and the benchmark, so the two cannot drift apart.
 */
export function resolveStoredFeature(
  mode: string,
  id: number,
  geojson: string | undefined
): RawGeoJSONFeature | undefined {
  const cacheKey = `${mode}:${id}`
  const cached = getCachedGeometry(cacheKey)

  if (cached) {
    return cached
  }

  const parsed = parseStoredFeature(geojson)

  if (parsed) {
    cacheGeometry(cacheKey, parsed)
  }

  return parsed
}
