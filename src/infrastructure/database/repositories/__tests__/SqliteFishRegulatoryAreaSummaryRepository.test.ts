import type { DB } from '@op-engineering/op-sqlite'
import type { FishRegulatoryAreaSummaryRow } from '../../rows/FishRegulatoryAreaSummaryRow'
import { createSqliteFishRegulatoryAreaSummaryRepository } from '../SqliteFishRegulatoryAreaSummaryRepository'

type ExecutedStatement = { params: unknown[]; sql: string }

const ROW: FishRegulatoryAreaSummaryRow = {
  bbox_max_lat: 49,
  bbox_max_lon: -3,
  bbox_min_lat: 48,
  bbox_min_lon: -4,
  colorKey: 'yaleBlue',
  fishingPeriods: null,
  gears: null,
  generalRemarks: null,
  id: 7,
  regulatoryReferences: null,
  species: null,
  theme: 'Thématique',
  totalByGroup: 3,
  type: 'Reg. NAMO',
  zone: 'Zone 7'
}

/** op-sqlite is native, so the statements are recorded rather than executed. */
function createRecordingDb(rows: unknown[] = [ROW]) {
  const statements: ExecutedStatement[] = []

  const db = {
    execute: async (sql: string, params: unknown[] = []) => {
      statements.push({ params, sql })

      return { rows }
    }
  } as unknown as DB

  return { db, statements }
}

describe('SqliteFishRegulatoryAreaSummaryRepository', () => {
  it('maps rows to stored areas, gathering the bounding box', async () => {
    const { db } = createRecordingDb()

    const [area] = await createSqliteFishRegulatoryAreaSummaryRepository(db).findAll()

    expect(area).toMatchObject({
      bbox: { maxLat: 49, maxLon: -3, minLat: 48, minLon: -4 },
      colorKey: 'yaleBlue',
      id: 7,
      totalByGroup: 3,
      zone: 'Zone 7'
    })
    expect(area).not.toHaveProperty('bbox_min_lon')
  })

  it('binds the bounding box overlap bounds in query order', async () => {
    const { db, statements } = createRecordingDb()

    await createSqliteFishRegulatoryAreaSummaryRepository(db).findOverlapping({
      maxLat: 50,
      maxLon: 0,
      minLat: 47,
      minLon: -5
    })

    expect(statements[0]?.sql).toMatch(
      /bbox_max_lon >= \? AND bbox_min_lon <= \? AND bbox_max_lat >= \? AND bbox_min_lat <= \?/
    )
    expect(statements[0]?.params).toEqual([-5, 0, 47, 50])
  })

  it('does not query for an empty id list', async () => {
    const { db, statements } = createRecordingDb()

    expect(await createSqliteFishRegulatoryAreaSummaryRepository(db).findByIds([])).toEqual([])
    expect(statements).toHaveLength(0)
  })

  it('degrades to no areas when the query fails', async () => {
    const db = {
      execute: async () => {
        throw new Error('disk I/O error')
      }
    } as unknown as DB

    expect(await createSqliteFishRegulatoryAreaSummaryRepository(db).findAll()).toEqual([])
  })
})
