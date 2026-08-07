import type { DB } from '@op-engineering/op-sqlite'
import type { BoundingBox } from '@/types/mapTypes'
import { FISH_REGULATORY_AREAS_TABLE } from '../db.schema'
import type { FishRegulatoryAreaFromDatabase } from '@/types/regulatoryAreasTypes'

export async function getFishRegulatoryAreasQuery(
  db: DB,
  bbox: BoundingBox
): Promise<FishRegulatoryAreaFromDatabase[]> {
  const { minLon, minLat, maxLon, maxLat } = bbox

  try {
    const result = await db.execute(
      `
        SELECT
          fish.id,
          fish.type,
          fish.theme,
          fish.zone,
          fish.regulations,
          fish.geojson,
          fish.bbox_min_lon,
          fish.bbox_min_lat,
          fish.bbox_max_lon,
          fish.bbox_max_lat,
          fish.fill_color as fillColor
        FROM ${FISH_REGULATORY_AREAS_TABLE} AS fish
        WHERE fish.bbox_max_lon >= ?
          AND fish.bbox_min_lon <= ?
          AND fish.bbox_max_lat >= ?
          AND fish.bbox_min_lat <= ?
        ORDER BY fish.id
      `,
      [minLon, maxLon, minLat, maxLat]
    )

    return result.rows as FishRegulatoryAreaFromDatabase[]
  } catch (error) {
    // oxlint-disable-next-line no-console
    console.warn('Error fetching areas', error)
    return []
  }
}
