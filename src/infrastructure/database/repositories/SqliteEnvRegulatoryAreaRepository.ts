import type { DB } from '@op-engineering/op-sqlite'
import { monitorEnvConfig } from '@config/appModes/monitorenv.config'
import { ENV_REGULATORY_AREAS_TABLE } from '@database/db.schema'
import type { EnvRegulatoryArea } from '@domain/entities/regulatoryAreas/EnvRegulatoryArea'
import type { LocalEnvRegulatoryAreaRepository } from '@domain/repositories/LocalEnvRegulatoryAreaRepository'
import { normalizeFeatureProperty, stringToArrayItem } from '@utils/layersStyle'
import { clearGeometryCache } from '@utils/geometryCache'
import { logSentryError } from '@utils/sentryLogger'

function buildFeatureColorKey(area: EnvRegulatoryArea): string {
  return [
    normalizeFeatureProperty(area.id),
    normalizeFeatureProperty(area.polyName ?? area.resume),
    normalizeFeatureProperty(area.themes)
  ].join('-')
}

/** The list groups env areas by layer name and location, and shows "shown / total" against this. */
function buildGroupKey(area: EnvRegulatoryArea): string {
  return `${area.layerName} - ${area.location}`
}

function countByGroup(areas: EnvRegulatoryArea[]): Map<string, number> {
  const totals = new Map<string, number>()

  for (const area of areas) {
    const key = buildGroupKey(area)
    totals.set(key, (totals.get(key) ?? 0) + 1)
  }

  return totals
}

export function createSqliteEnvRegulatoryAreaRepository(db: DB): LocalEnvRegulatoryAreaRepository {
  return {
    countAll: async () => {
      const result = await db.execute(`SELECT COUNT(*) AS count FROM ${ENV_REGULATORY_AREAS_TABLE}`)

      return Number(result.rows?.[0]?.count ?? 0)
    },

    deleteAll: async () => {
      await db.execute(`DELETE FROM ${ENV_REGULATORY_AREAS_TABLE}`)
      clearGeometryCache()
    },

    replaceForSeaFronts: async (seaFronts: string[], areas: EnvRegulatoryArea[]) => {
      const palette = monitorEnvConfig?.colors
      const placeholders = seaFronts.map(() => '?').join(',')
      const totalsByGroup = countByGroup(areas)

      try {
        await db.transaction(async tx => {
          await tx.execute('CREATE TEMP TABLE IF NOT EXISTS tmp_env_synced_ids (id INTEGER PRIMARY KEY)')
          await tx.execute('DELETE FROM tmp_env_synced_ids')

          for (const area of areas) {
            await tx.execute('INSERT OR IGNORE INTO tmp_env_synced_ids (id) VALUES (?)', [area.id])
          }

          await tx.execute(`DELETE FROM ${ENV_REGULATORY_AREAS_TABLE} WHERE facade NOT IN (${placeholders})`, seaFronts)
          await tx.execute(
            `DELETE FROM ${ENV_REGULATORY_AREAS_TABLE}
               WHERE facade IN (${placeholders})
               AND id NOT IN (SELECT id FROM tmp_env_synced_ids)`,
            seaFronts
          )

          for (const area of areas) {
            const fillColor = stringToArrayItem(buildFeatureColorKey(area), palette) ?? palette[0]

            await tx.execute(
              `
                INSERT OR REPLACE INTO ${ENV_REGULATORY_AREAS_TABLE} (
                  id, url, layer_name, facade, ref_reg, date, date_fin, type, geojson,
                  resume, plan, poly_name, authorization_periods, prohibition_periods,
                  additional_ref_reg, themes, location, fill_color, edition,
                  bbox_min_lon, bbox_min_lat, bbox_max_lon, bbox_max_lat,
                  total_by_group
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              `,
              [
                area.id,
                area.url,
                area.layerName,
                area.facade,
                area.refReg,
                area.date,
                area.dateFin,
                area.type,
                area.geometry ?? null,
                area.resume,
                area.plan,
                area.polyName,
                area.authorizationPeriods,
                area.prohibitionPeriods,
                area.additionalRefReg,
                area.themes,
                area.location,
                fillColor ?? null,
                area.edition ?? null,
                area.boundingBox?.minLon ?? null,
                area.boundingBox?.minLat ?? null,
                area.boundingBox?.maxLon ?? null,
                area.boundingBox?.maxLat ?? null,
                totalsByGroup.get(buildGroupKey(area)) ?? 0
              ]
            )
          }
        })
        clearGeometryCache()
      } catch (error) {
        logSentryError(error, 'Transaction failed during env sync')
        throw error
      }
    }
  }
}
