import type { DB, Scalar, SQLBatchTuple } from '@op-engineering/op-sqlite'
import { monitorFishConfig } from '@config/appModes/monitorfish.config'
import { FISH_REGULATORY_AREAS_TABLE } from '@database/db.schema'
import { toRegulationType } from '@domain/entities/regulatoryAreas/FishRegulatoryArea'
import type { FishRegulatoryArea } from '@domain/entities/regulatoryAreas/FishRegulatoryArea'
import type { LocalFishRegulatoryAreaRepository } from '@domain/repositories/LocalFishRegulatoryAreaRepository'
import { normalizeFeatureProperty, stringToArrayItem } from '@utils/layersStyle'
import { logSentryError } from '@utils/sentryLogger'

const INSERT_AREA = `
  INSERT OR REPLACE INTO ${FISH_REGULATORY_AREAS_TABLE} (
    id, type, theme, zone, fill_color,
    regulatory_references, fishing_periods, gears, species, general_remarks,
    geojson,
    bbox_min_lon, bbox_min_lat, bbox_max_lon, bbox_max_lat,
    total_by_group,
    geojson_coarse
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`

/** The list groups fish areas by theme, and shows "shown / total" against this stored count. */
function countByGroup(areas: FishRegulatoryArea[]): Map<string, number> {
  const totals = new Map<string, number>()

  for (const area of areas) {
    totals.set(area.theme, (totals.get(area.theme) ?? 0) + 1)
  }

  return totals
}

function buildFeatureColorKey(area: FishRegulatoryArea): string {
  return [
    normalizeFeatureProperty(area.id),
    normalizeFeatureProperty(area.type),
    normalizeFeatureProperty(area.theme)
  ].join('-')
}

export function createSqliteFishRegulatoryAreaRepository(db: DB): LocalFishRegulatoryAreaRepository {
  return {
    countAll: async () => {
      const result = await db.execute(`SELECT COUNT(*) AS count FROM ${FISH_REGULATORY_AREAS_TABLE}`)

      return Number(result.rows?.[0]?.count ?? 0)
    },

    deleteAll: async () => {
      await db.execute(`DELETE FROM ${FISH_REGULATORY_AREAS_TABLE}`)
    },

    replaceForSeaFronts: async (seaFronts: string[], areas: FishRegulatoryArea[]) => {
      const palette = monitorFishConfig?.colors
      // Rows store the prefixed type, so comparing against a bare sea front matches nothing.
      const regulationTypes = seaFronts.map(toRegulationType)
      const placeholders = regulationTypes.map(() => '?').join(',')

      const totalsByGroup = countByGroup(areas)

      const rows: Scalar[][] = areas.map(area => {
        const fillColor = stringToArrayItem(buildFeatureColorKey(area), palette) ?? palette[0]

        return [
          area.id,
          area.type,
          area.theme,
          area.zone,
          fillColor ?? null,
          area.regulatoryReferences ?? null,
          area.fishingPeriods ?? null,
          area.gears ?? null,
          area.species ?? null,
          area.generalRemarks ?? null,
          area.geometry ?? null,
          area.boundingBox?.minLon ?? null,
          area.boundingBox?.minLat ?? null,
          area.boundingBox?.maxLon ?? null,
          area.boundingBox?.maxLat ?? null,
          totalsByGroup.get(area.theme) ?? 0,
          area.geometryCoarse ?? null
        ]
      })

      const commands: SQLBatchTuple[] = [
        [`DELETE FROM ${FISH_REGULATORY_AREAS_TABLE} WHERE type NOT IN (${placeholders})`, regulationTypes],
        [`DELETE FROM ${FISH_REGULATORY_AREAS_TABLE} WHERE type IN (${placeholders})`, regulationTypes]
      ]

      if (rows.length > 0) {
        commands.push([INSERT_AREA, rows])
      }

      try {
        await db.executeBatch(commands)
      } catch (error) {
        logSentryError(error, 'Transaction failed during fish sync')
        throw error
      }
    }
  }
}
