import type { DB, Scalar, SQLBatchTuple } from '@op-engineering/op-sqlite'
import type { FishRegulatoryArea } from '@domain/entities/regulatoryAreas/FishRegulatoryArea'
import { createSqliteFishRegulatoryAreaRepository } from '../SqliteFishRegulatoryAreaRepository'

type ExecutedStatement = { params: unknown[]; sql: string }

/** op-sqlite is native, so the statements are recorded rather than executed. */
function createRecordingDb() {
  const statements: ExecutedStatement[] = []
  const batches: SQLBatchTuple[][] = []

  const execute = async (sql: string, params: unknown[] = []) => {
    statements.push({ params, sql })

    return { rows: [{ count: 0 }] }
  }

  const db = {
    execute,
    executeBatch: async (commands: SQLBatchTuple[]) => {
      batches.push(commands)

      return { rowsAffected: 0 }
    }
  } as unknown as DB

  /** The single batch `replaceForSeaFronts` sends. */
  const batch = () => batches[0] ?? []
  const matching = (pattern: RegExp) => batch().filter(([sql]) => pattern.test(sql))
  /** The parameter sets bound to the insert, one per area. */
  const insertedRows = () => (matching(/INSERT OR REPLACE INTO fish_regulatory_areas/)[0]?.[1] ?? []) as Scalar[][]

  return { batch, batches, db, insertedRows, matching, statements }
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

      await createSqliteFishRegulatoryAreaRepository(db).replaceForSeaFronts(
        ['NAMO'],
        [buildArea(1), buildArea(2), buildArea(3)]
      )

      expect(insertedRows()).toHaveLength(3)
      expect(insertedRows().map(row => row[0])).toEqual([1, 2, 3])
    })

    it('sends the whole replacement as a single batch, not a statement per area', async () => {
      const { batch, batches, db } = createRecordingDb()

      await createSqliteFishRegulatoryAreaRepository(db).replaceForSeaFronts(
        ['NAMO'],
        Array.from({ length: 50 }, (_, index) => buildArea(index + 1))
      )

      expect(batches).toHaveLength(1)
      expect(batch()).toHaveLength(3)
    })

    it('uses INSERT OR REPLACE so a re-sync does not collide on the primary key', async () => {
      const { db, matching } = createRecordingDb()

      await createSqliteFishRegulatoryAreaRepository(db).replaceForSeaFronts(['NAMO'], [buildArea(1)])

      expect(matching(/INSERT INTO fish_regulatory_areas/)).toHaveLength(0)
      expect(matching(/INSERT OR REPLACE INTO fish_regulatory_areas/)).toHaveLength(1)
    })

    it('prunes using the prefixed regulation type, not the bare sea front', async () => {
      const { db, matching } = createRecordingDb()

      await createSqliteFishRegulatoryAreaRepository(db).replaceForSeaFronts(['NAMO', 'MEMN'], [buildArea(1)])

      const deletes = matching(/DELETE FROM fish_regulatory_areas/)
      expect(deletes).toHaveLength(2)

      for (const [, params] of deletes) {
        expect(params).toEqual(['Reg. NAMO', 'Reg. MEMN'])
      }
    })

    it('drops areas of other sea fronts and areas no longer published', async () => {
      const { db, matching } = createRecordingDb()

      await createSqliteFishRegulatoryAreaRepository(db).replaceForSeaFronts(['NAMO'], [buildArea(1)])

      const deletes = matching(/DELETE FROM fish_regulatory_areas/)
      expect(deletes[0]?.[0]).toMatch(/type NOT IN/)
      expect(deletes[1]?.[0]).toMatch(/type IN/)
    })

    it('keeps both delete predicates so a row with no type is left alone', async () => {
      const { db, matching } = createRecordingDb()

      await createSqliteFishRegulatoryAreaRepository(db).replaceForSeaFronts(['NAMO'], [buildArea(1)])

      expect(matching(/^\s*DELETE FROM fish_regulatory_areas\s*$/)).toHaveLength(0)
    })

    it('writes the bounding box alongside the geometry', async () => {
      const { db, insertedRows } = createRecordingDb()

      await createSqliteFishRegulatoryAreaRepository(db).replaceForSeaFronts(['NAMO'], [buildArea(1)])

      expect(insertedRows()[0]?.slice(10, 15)).toEqual(['{"type":"Polygon","coordinates":[]}', -4, 48, -3, 49])
    })

    it('stores nulls rather than undefined when an area has no geometry', async () => {
      const { db, insertedRows } = createRecordingDb()
      const area = { ...buildArea(1), boundingBox: undefined, geometry: undefined }

      await createSqliteFishRegulatoryAreaRepository(db).replaceForSeaFronts(['NAMO'], [area])

      expect(insertedRows()[0]?.slice(10, 15)).toEqual([null, null, null, null, null])
    })

    it('stores how many areas each theme holds, so the list can show a total per group', async () => {
      const { db, insertedRows } = createRecordingDb()
      const areas = [
        { ...buildArea(1), theme: 'Thématique A' },
        { ...buildArea(2), theme: 'Thématique A' },
        { ...buildArea(3), theme: 'Thématique B' }
      ]

      await createSqliteFishRegulatoryAreaRepository(db).replaceForSeaFronts(['NAMO'], areas)

      expect(insertedRows().map(row => row[15])).toEqual([2, 2, 1])
    })

    it('writes the columns the delivery publishes: references, periods, gears, species, remarks', async () => {
      const { db, insertedRows } = createRecordingDb()

      await createSqliteFishRegulatoryAreaRepository(db).replaceForSeaFronts(['NAMO'], [buildArea(1)])

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

      await createSqliteFishRegulatoryAreaRepository(db).replaceForSeaFronts(['NAMO'], [area])

      expect(insertedRows()[0]?.slice(5, 10)).toEqual([null, null, null, null, null])
    })

    it('assigns a fill colour', async () => {
      const { db, insertedRows } = createRecordingDb()

      await createSqliteFishRegulatoryAreaRepository(db).replaceForSeaFronts(['NAMO'], [buildArea(1)])

      expect(insertedRows()[0]?.[4]).toEqual(expect.any(String))
    })

    it('still prunes, but binds no insert, when nothing is published', async () => {
      const { batch, db, matching } = createRecordingDb()

      await createSqliteFishRegulatoryAreaRepository(db).replaceForSeaFronts(['NAMO'], [])

      expect(batch()).toHaveLength(2)
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
