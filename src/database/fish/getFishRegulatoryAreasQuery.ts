import type { DB } from '@op-engineering/op-sqlite'
import type { BoundingBox } from '@/types/mapTypes'
import { FISH_REGULATORY_AREAS_TABLE } from '../db.schema'
import type { FishRegulatoryAreaFromDatabase } from '@/types/regulatoryAreasTypes'
import { logSentryError } from '@utils/sentryLogger'
import { MAX_REGULATORY_AREAS_PER_QUERY, minimumVisibleBboxSize } from '../regulatoryAreasQueryConfig'

export async function getFishRegulatoryAreasQuery(
  db: DB,
  bbox: BoundingBox,
  zoom?: number
): Promise<FishRegulatoryAreaFromDatabase[]> {
  const { minLon, minLat, maxLon, maxLat } = bbox
  const minSize = minimumVisibleBboxSize(zoom)

  try {
    const result = await db.execute(
      `
        SELECT
          fish.id,
          fish.type,
          fish.theme,
          fish.zone,
          fish.regulatory_references as regulatoryReferences,
          fish.fishing_periods as fishingPeriods,
          fish.gears,
          fish.species,
          fish.general_remarks as generalRemarks,
          fish.bbox_min_lon,
          fish.bbox_min_lat,
          fish.bbox_max_lon,
          fish.bbox_max_lat,
          fish.fill_color as fillColor,
          fish.total_by_group as totalByGroup
        FROM ${FISH_REGULATORY_AREAS_TABLE} AS fish
        WHERE fish.bbox_max_lon >= ?
          AND fish.bbox_min_lon <= ?
          AND fish.bbox_max_lat >= ?
          AND fish.bbox_min_lat <= ?
          AND (fish.bbox_max_lon - fish.bbox_min_lon >= ? OR fish.bbox_max_lat - fish.bbox_min_lat >= ?)
        ORDER BY (fish.bbox_max_lon - fish.bbox_min_lon) * (fish.bbox_max_lat - fish.bbox_min_lat) DESC
        LIMIT ?
      `,
      [minLon, maxLon, minLat, maxLat, minSize, minSize, MAX_REGULATORY_AREAS_PER_QUERY]
    )

    return result.rows as FishRegulatoryAreaFromDatabase[]
  } catch (error) {
    logSentryError(error, 'Error fetching Fish areas')
    return []
  }
}
