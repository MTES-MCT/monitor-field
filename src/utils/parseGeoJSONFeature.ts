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
