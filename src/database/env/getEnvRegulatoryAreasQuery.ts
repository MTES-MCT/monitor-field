import type { DB } from '@op-engineering/op-sqlite'
import type { BoundingBox } from '@/types/mapTypes'
import { ENV_REGULATORY_AREAS_TABLE } from '../db.schema'
import type { EnvRegulatoryAreaFromDatabase } from '@/types/regulatoryAreasTypes'
import { logSentryError } from '@utils/sentryLogger'

export async function getEnvRegulatoryAreasQuery(db: DB, bbox?: BoundingBox): Promise<EnvRegulatoryAreaFromDatabase[]> {
  const params: number[] = []
  const whereClause = bbox
    ? 'WHERE env.bbox_max_lon >= ? AND env.bbox_min_lon <= ? AND env.bbox_max_lat >= ? AND env.bbox_min_lat <= ?'
    : ''

  if (bbox) {
    params.push(bbox.minLon, bbox.maxLon, bbox.minLat, bbox.maxLat)
  }

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
          env.location,
          env.edition,
          env.bbox_min_lon,
          env.bbox_min_lat,
          env.bbox_max_lon,
          env.bbox_max_lat,
          env.fill_color as fillColor,
          env.total_by_group as totalByGroup
        FROM ${ENV_REGULATORY_AREAS_TABLE} AS env
        ${whereClause}
        ORDER BY (env.bbox_max_lon - env.bbox_min_lon) * (env.bbox_max_lat - env.bbox_min_lat) DESC
      `,
      params
    )

    return result.rows as EnvRegulatoryAreaFromDatabase[]
  } catch (error) {
    logSentryError(error, 'Error fetching Env areas')
    return []
  }
}
