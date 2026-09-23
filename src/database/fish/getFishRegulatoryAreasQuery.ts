import type { DB } from '@op-engineering/op-sqlite'
import type { BoundingBox } from '@/types/mapTypes'
import { FISH_REGULATORY_AREAS_TABLE } from '../db.schema'
import type { FishRegulatoryAreaFromDatabase } from '@/types/regulatoryAreasTypes'
import { logSentryError } from '@utils/sentryLogger'

export async function getFishRegulatoryAreasQuery(
  db: DB,
  bbox?: BoundingBox
): Promise<FishRegulatoryAreaFromDatabase[]> {
  const params: number[] = []
  const whereClause = bbox
    ? 'WHERE fish.bbox_max_lon >= ? AND fish.bbox_min_lon <= ? AND fish.bbox_max_lat >= ? AND fish.bbox_min_lat <= ?'
    : ''

  if (bbox) {
    params.push(bbox.minLon, bbox.maxLon, bbox.minLat, bbox.maxLat)
  }

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
        ${whereClause}
        ORDER BY (fish.bbox_max_lon - fish.bbox_min_lon) * (fish.bbox_max_lat - fish.bbox_min_lat) DESC
      `,
      params
    )

    return result.rows as FishRegulatoryAreaFromDatabase[]
  } catch (error) {
    logSentryError(error, 'Error fetching Fish areas')
    return []
  }
}
