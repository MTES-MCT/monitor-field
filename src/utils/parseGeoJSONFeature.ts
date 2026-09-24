import type { RawGeoJSONFeature } from '@/types/mapTypes'

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

  // The stored geometry is produced by `parseWktToGeojson` (WKT → GeoJSON) or comes straight from
  // GeoServer, so it is already structurally valid. A full coordinate-by-coordinate Zod validation
  // here is prohibitively expensive on large geometries (hundreds of thousands of vertices) and is
  // only needed as a cheap guard against null/malformed rows before intersection and rendering.
  const geometry = json?.geometry

  if (
    json?.type !== 'Feature' ||
    (geometry?.type !== 'Polygon' && geometry?.type !== 'MultiPolygon') ||
    !Array.isArray(geometry?.coordinates)
  ) {
    return undefined
  }

  return json as RawGeoJSONFeature
}
