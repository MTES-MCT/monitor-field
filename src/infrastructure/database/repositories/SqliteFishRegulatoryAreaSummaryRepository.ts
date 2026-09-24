import type { DB } from '@op-engineering/op-sqlite'
import { FISH_REGULATORY_AREAS_TABLE } from '@database/db.schema'
import type { FishRegulatoryAreaSummaryRepository } from '@domain/repositories/FishRegulatoryAreaSummaryRepository'
import type { BoundingBox } from '@/types/mapTypes'
import { logSentryError } from '@utils/sentryLogger'
import {
  FISH_REGULATORY_AREA_SUMMARY_COLUMNS,
  toFishRegulatoryAreaSummary,
  type FishRegulatoryAreaSummaryRow
} from '../rows/FishRegulatoryAreaSummaryRow'

const SELECT_SUMMARIES = `SELECT ${FISH_REGULATORY_AREA_SUMMARY_COLUMNS} FROM ${FISH_REGULATORY_AREAS_TABLE}`

export function createSqliteFishRegulatoryAreaSummaryRepository(db: DB): FishRegulatoryAreaSummaryRepository {
  // A failed read shows no areas rather than breaking the screen.
  const findWhere = async (whereClause: string, params: number[]) => {
    try {
      const result = await db.execute(`${SELECT_SUMMARIES} ${whereClause}`, params)

      return (result.rows as FishRegulatoryAreaSummaryRow[]).map(toFishRegulatoryAreaSummary)
    } catch (error) {
      logSentryError(error, 'Error fetching Fish areas')

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
