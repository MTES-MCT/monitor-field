import type { DB } from '@op-engineering/op-sqlite'
import { ENV_REGULATORY_AREAS_TABLE, FISH_REGULATORY_AREAS_TABLE } from '@database/db.schema'
import type { RegulatoryAreaDataset } from '@domain/entities/regulatoryAreas/RegulatoryAreaDataset'
import type { RegulatoryAreaGeometryRepository } from '@domain/repositories/RegulatoryAreaGeometryRepository'
import {
  REGULATORY_AREA_GEOMETRY_COLUMNS,
  toRegulatoryAreaGeometry,
  type RegulatoryAreaGeometryRow
} from '../rows/RegulatoryAreaGeometryRow'

const TABLES: Record<RegulatoryAreaDataset, string> = {
  env: ENV_REGULATORY_AREAS_TABLE,
  fish: FISH_REGULATORY_AREAS_TABLE
}

export function createSqliteRegulatoryAreaGeometryRepository(db: DB): RegulatoryAreaGeometryRepository {
  return {
    findAllByDataset: async (dataset: RegulatoryAreaDataset) => {
      const startedAt = Date.now()
      // eslint-disable-next-line no-console
      console.log(`[tiles] ${dataset}: reading geometry from SQLite…`)

      const result = await db.execute(`SELECT ${REGULATORY_AREA_GEOMETRY_COLUMNS} FROM ${TABLES[dataset]}`)

      // eslint-disable-next-line no-console
      console.log(`[tiles] ${dataset}: read ${result.rows.length} rows (${Date.now() - startedAt}ms)`)

      return (result.rows as RegulatoryAreaGeometryRow[]).map(toRegulatoryAreaGeometry)
    }
  }
}
