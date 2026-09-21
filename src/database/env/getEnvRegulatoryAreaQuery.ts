import type { DB } from '@op-engineering/op-sqlite'
import { ENV_REGULATORY_AREAS_TABLE } from '../db.schema'
import type { EnvRegulatoryAreaFromDatabase } from '@/types/regulatoryAreasTypes'
import { logSentryError } from '@utils/sentryLogger'

export async function getEnvRegulatoryAreaQuery(
  db: DB,
  id: number
): Promise<EnvRegulatoryAreaFromDatabase | undefined> {
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
          env.geojson,
          env.location,
          env.edition,
          env.bbox_min_lon,
          env.bbox_min_lat,
          env.bbox_max_lon,
          env.bbox_max_lat,
          env.fill_color as fillColor,
          env.total_by_group as totalByGroup
        FROM ${ENV_REGULATORY_AREAS_TABLE} AS env
        WHERE env.id = ?
        ORDER BY env.id
      `,
      [id]
    )

    return result.rows[0] as EnvRegulatoryAreaFromDatabase
  } catch (error) {
    logSentryError(error, `Error fetching Env regulatory area with id ${id}`)
    return undefined
  }
}
