import { RawGeoJSONFeatureSchema, type RawGeoJSONFeature } from '@/types/schemas'

export function parseGeoJSONFeature(raw: string | undefined): RawGeoJSONFeature | undefined {
  if (!raw) {
    return undefined
  }

  let json
  try {
    json = JSON.parse(raw)
  } catch {
    return undefined
  }

  const result = RawGeoJSONFeatureSchema.safeParse(json)

  if (!result.success) {
    return undefined
  }

  return result.data
}

/**
 * Parses a feature stored at sync time without re-validating its geometry.
 *
 * The geometry is already validated once at ingest (`toEnvRegulatoryArea` /
 * `toFishRegulatoryArea` run it through `RawGeoJSONFeatureSchema`), so the search hot path only
 * needs the raw JSON — not a coordinate-by-coordinate Zod walk. A cheap structural check still
 * rejects rows that are not a GeoJSON Feature.
 */
export function parseStoredFeature(raw: string | undefined): RawGeoJSONFeature | undefined {
  if (!raw) {
    return undefined
  }

  let feature: unknown
  try {
    feature = JSON.parse(raw)
  } catch {
    return undefined
  }

  if (
    typeof feature !== 'object' ||
    feature === null ||
    (feature as { type?: unknown }).type !== 'Feature' ||
    (feature as { geometry?: unknown }).geometry == null
  ) {
    return undefined
  }

  return feature as RawGeoJSONFeature
}
