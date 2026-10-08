import type { DB, Scalar } from '@op-engineering/op-sqlite'
import type { FishRegulatoryArea } from '@domain/entities/regulatoryAreas/FishRegulatoryArea'
import { createSqliteFishRegulatoryAreaRepository } from '../SqliteFishRegulatoryAreaRepository'

type ExecutedStatement = { params: unknown[]; sql: string }

/** op-sqlite is native, so the statements are recorded rather than executed. */
function createRecordingDb() {
  const statements: ExecutedStatement[] = []

  const execute = async (sql: string, params: unknown[] = []) => {
    statements.push({ params, sql })

    return { rows: [{ count: 0 }] }
  }

  const db = { execute } as unknown as DB

  const matching = (pattern: RegExp) => statements.filter(({ sql }) => pattern.test(sql))
  /** The parameter sets bound to each insert, one per area. */
  const insertedRows = () =>
    matching(/INSERT OR REPLACE INTO fish_regulatory_areas/).map(({ params }) => params as Scalar[])

  return { db, insertedRows, matching, statements }
}

function buildArea(id: number, seaFront = 'NAMO'): FishRegulatoryArea {
  return {
    boundingBox: { maxLat: 49, maxLon: -3, minLat: 48, minLon: -4 },
    fishingPeriods: '{"weekdays": ["lundi"]}',
    gears: '{"regulatedGears": []}',
    generalRemarks: `Remarques ${id}`,
    geometry: '{"type":"Polygon","coordinates":[]}',
    id,
    regulatoryReferences: `[{"reference": "Arrêté ${id}"}]`,
    species: '{"regulatedSpecies": []}',
    theme: 'Thématique',
    type: `Reg. ${seaFront}`,
    zone: `Zone ${id}`
  }
}

describe('createSqliteFishRegulatoryAreaRepository', () => {
  describe('replaceForSeaFronts', () => {
    it('inserts every area', async () => {
      const { db, insertedRows } = createRecordingDb()

      await createSqliteFishRegulatoryAreaRepository(db).replaceForSeaFronts([buildArea(1), buildArea(2), buildArea(3)])

      expect(insertedRows()).toHaveLength(3)
      expect(insertedRows().map(row => row[0])).toEqual([1, 2, 3])
    })

    it('clears the table before inserting', async () => {
      const { db, statements } = createRecordingDb()

      await createSqliteFishRegulatoryAreaRepository(db).replaceForSeaFronts([buildArea(1), buildArea(2)])

      expect(statements).toHaveLength(3)
      expect(statements[0]?.sql).toMatch(/^DELETE FROM fish_regulatory_areas$/)
    })

    it('uses INSERT OR REPLACE so a re-sync does not collide on the primary key', async () => {
      const { db, matching } = createRecordingDb()

      await createSqliteFishRegulatoryAreaRepository(db).replaceForSeaFronts([buildArea(1)])

      expect(matching(/INSERT INTO fish_regulatory_areas/)).toHaveLength(0)
      expect(matching(/INSERT OR REPLACE INTO fish_regulatory_areas/)).toHaveLength(1)
    })

    it('writes the bounding box alongside the geometry', async () => {
      const { db, insertedRows } = createRecordingDb()

      await createSqliteFishRegulatoryAreaRepository(db).replaceForSeaFronts([buildArea(1)])

      expect(insertedRows()[0]?.slice(10, 15)).toEqual(['{"type":"Polygon","coordinates":[]}', -4, 48, -3, 49])
    })

    it('stores nulls rather than undefined when an area has no geometry', async () => {
      const { db, insertedRows } = createRecordingDb()
      const area = { ...buildArea(1), boundingBox: undefined, geometry: undefined }

      await createSqliteFishRegulatoryAreaRepository(db).replaceForSeaFronts([area])

      expect(insertedRows()[0]?.slice(10, 15)).toEqual([null, null, null, null, null])
    })

    it('stores how many areas each theme holds, so the list can show a total per group', async () => {
      const { db, insertedRows } = createRecordingDb()
      const areas = [
        { ...buildArea(1), theme: 'Thématique A' },
        { ...buildArea(2), theme: 'Thématique A' },
        { ...buildArea(3), theme: 'Thématique B' }
      ]

      await createSqliteFishRegulatoryAreaRepository(db).replaceForSeaFronts(areas)

      expect(insertedRows().map(row => row[15])).toEqual([2, 2, 1])
    })

    it('writes the columns the delivery publishes: references, periods, gears, species, remarks', async () => {
      const { db, insertedRows } = createRecordingDb()

      await createSqliteFishRegulatoryAreaRepository(db).replaceForSeaFronts([buildArea(1)])

      expect(insertedRows()[0]?.slice(5, 10)).toEqual([
        '[{"reference": "Arrêté 1"}]',
        '{"weekdays": ["lundi"]}',
        '{"regulatedGears": []}',
        '{"regulatedSpecies": []}',
        'Remarques 1'
      ])
    })

    it('stores nulls rather than undefined when the delivery omits the optional columns', async () => {
      const { db, insertedRows } = createRecordingDb()
      const area = {
        ...buildArea(1),
        fishingPeriods: undefined,
        gears: undefined,
        generalRemarks: undefined,
        regulatoryReferences: undefined,
        species: undefined
      }

      await createSqliteFishRegulatoryAreaRepository(db).replaceForSeaFronts([area])

      expect(insertedRows()[0]?.slice(5, 10)).toEqual([null, null, null, null, null])
    })

    it('assigns a fill color', async () => {
      const { db, insertedRows } = createRecordingDb()

      await createSqliteFishRegulatoryAreaRepository(db).replaceForSeaFronts([buildArea(1)])

      expect(insertedRows()[0]?.[4]).toEqual(expect.any(String))
    })

    it('still clears the table, but inserts nothing, when nothing is published', async () => {
      const { db, matching, statements } = createRecordingDb()

      await createSqliteFishRegulatoryAreaRepository(db).replaceForSeaFronts([])

      expect(statements).toHaveLength(1)
      expect(matching(/INSERT OR REPLACE/)).toHaveLength(0)
    })
  })

  it('counts the stored areas', async () => {
    const { db } = createRecordingDb()

    expect(await createSqliteFishRegulatoryAreaRepository(db).countAll()).toBe(0)
  })

  it('deletes every area', async () => {
    const { db, statements } = createRecordingDb()

    await createSqliteFishRegulatoryAreaRepository(db).deleteAll()

    expect(statements.filter(statement => /^DELETE FROM fish_regulatory_areas$/.test(statement.sql))).toHaveLength(1)
  })
})
