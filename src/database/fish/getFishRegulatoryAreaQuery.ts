import type { DB } from '@op-engineering/op-sqlite'
import { FISH_REGULATORY_AREAS_TABLE } from '../db.schema'
import type { FishRegulatoryAreaFromDatabase } from '@/types/regulatoryAreasTypes'
import { logSentryError } from '@utils/sentryLogger'

export async function getFishRegulatoryAreaQuery(
  db: DB,
  id: number
): Promise<FishRegulatoryAreaFromDatabase | undefined> {
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
          fish.fill_color as fillColor,
          fish.total_by_group as totalByGroup
        FROM ${FISH_REGULATORY_AREAS_TABLE} AS fish
        WHERE fish.id = ?
        ORDER BY fish.id
      `,
      [id]
    )

    return result.rows[0] as FishRegulatoryAreaFromDatabase
  } catch (error) {
    logSentryError(error, `Error fetching Fish regulatory area with id ${id}`)
    return undefined
  }
}
