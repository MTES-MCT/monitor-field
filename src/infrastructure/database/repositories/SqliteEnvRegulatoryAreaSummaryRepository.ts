import type { DB } from '@op-engineering/op-sqlite'
import { ENV_REGULATORY_AREAS_TABLE } from '@database/db.schema'
import type { EnvRegulatoryAreaSummaryRepository } from '@domain/repositories/EnvRegulatoryAreaSummaryRepository'
import type { BoundingBox } from '@/types/mapTypes'
import { logSentryError } from '@utils/sentryLogger'
import {
  ENV_REGULATORY_AREA_SUMMARY_COLUMNS,
  toEnvRegulatoryAreaSummary,
  type EnvRegulatoryAreaSummaryRow
} from '../rows/EnvRegulatoryAreaSummaryRow'

const SELECT_SUMMARIES = `SELECT ${ENV_REGULATORY_AREA_SUMMARY_COLUMNS} FROM ${ENV_REGULATORY_AREAS_TABLE}`

export function createSqliteEnvRegulatoryAreaSummaryRepository(db: DB): EnvRegulatoryAreaSummaryRepository {
  // A failed read shows no areas rather than breaking the screen.
  const findWhere = async (whereClause: string, params: number[]) => {
    try {
      const result = await db.execute(`${SELECT_SUMMARIES} ${whereClause}`, params)

      return (result.rows as EnvRegulatoryAreaSummaryRow[]).map(toEnvRegulatoryAreaSummary)
    } catch (error) {
      logSentryError(error, 'Error fetching Env areas')

      return []
    }
  }

  return {
    findAll: () => findWhere('', []),

    findByIds: async (ids: number[]) => {
      if (ids.length === 0) {
        return []
      }

      return findWhere(`WHERE id IN (${ids.map(() => '?').join(',')})`, ids)
    },

    findOverlapping: ({ maxLat, maxLon, minLat, minLon }: BoundingBox) =>
      findWhere('WHERE bbox_max_lon >= ? AND bbox_min_lon <= ? AND bbox_max_lat >= ? AND bbox_min_lat <= ?', [
        minLon,
        maxLon,
        minLat,
        maxLat
      ])
  }
}
