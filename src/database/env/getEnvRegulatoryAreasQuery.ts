import type { DB } from '@op-engineering/op-sqlite'
import type { BoundingBox } from '@/types/mapTypes'
import { ENV_REGULATORY_AREAS_TABLE } from '../db.schema'
import type { EnvRegulatoryAreaFromDatabase } from '@/types/regulatoryAreasTypes'

export async function getEnvRegulatoryAreasQuery(db: DB, bbox: BoundingBox): Promise<EnvRegulatoryAreaFromDatabase[]> {
  const { minLon, minLat, maxLon, maxLat } = bbox

  try {
    const result = await db.execute(
      `
        SELECT
          env.id,
          env.url,
          env.layer_name as layerName,
          env.facade,
          env.ref_reg as refReg,
          env.date,
          env.date_fin as dateFin,
          env.type,
          env.resume,
          env.plan,
          env.poly_name as polyName,
          env.authorization_periods as authorizationPeriods,
          env.prohibition_periods as prohibitionPeriods,
          env.additional_ref_reg as additionalRefReg,
          env.themes,
          env.tags,
          env.geojson,
          env.location,
          env.bbox_min_lon,
          env.bbox_min_lat,
          env.bbox_max_lon,
          env.bbox_max_lat,
          env.fill_color as fillColor
        FROM ${ENV_REGULATORY_AREAS_TABLE} AS env
        WHERE env.bbox_max_lon >= ?
          AND env.bbox_min_lon <= ?
          AND env.bbox_max_lat >= ?
          AND env.bbox_min_lat <= ?
        ORDER BY env.id
      `,
      [minLon, maxLon, minLat, maxLat]
    )
    // console.log('Fetched areas from database:', result.rows[0])

    return result.rows as EnvRegulatoryAreaFromDatabase[]
  } catch (error) {
    // oxlint-disable-next-line no-console
    console.warn('Error fetching areas', error)
    return []
  }
}
