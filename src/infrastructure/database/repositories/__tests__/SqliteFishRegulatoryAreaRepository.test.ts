import type { DB, Scalar, SQLBatchTuple } from '@op-engineering/op-sqlite'
import type { FishRegulatoryArea } from '@domain/entities/regulatoryAreas/FishRegulatoryArea'
import { createSqliteFishRegulatoryAreaRepository } from '../SqliteFishRegulatoryAreaRepository'

type ExecutedStatement = { params: Scalar[]; sql: string }

/** Expands a batch command into one statement per bound parameter set. */
function expandCommand([sql, params]: SQLBatchTuple): ExecutedStatement[] {
  if (Array.isArray(params) && Array.isArray(params[0])) {
    return (params as Scalar[][]).map(set => ({ params: set, sql }))
  }

  return [{ params: (params ?? []) as Scalar[], sql }]
}

/** op-sqlite is native, so the statements are recorded rather than executed. */
function createRecordingDb() {
  /** Everything that reached the database, whether through `execute` or `executeBatch`. */
  const statements: ExecutedStatement[] = []
  /** Only what went through `execute`, outside any batch. */
  const directStatements: ExecutedStatement[] = []
  const batches: SQLBatchTuple[][] = []

  const execute = async (sql: string, params: Scalar[] = []) => {
    directStatements.push({ params, sql })
    statements.push({ params, sql })

    return { rows: [{ count: 0 }] }
  }

  const db = {
    execute,
    executeBatch: async (commands: SQLBatchTuple[]) => {
      batches.push(commands)
      statements.push(...commands.flatMap(expandCommand))

      return { rowsAffected: 0 }
    }
  } as unknown as DB

  /** The single batch `replaceForSeaFronts` sends. */
  const batch = () => batches[0] ?? []
  const matching = (pattern: RegExp) => statements.filter(({ sql }) => pattern.test(sql))
  /** The parameter sets bound to each insert, one per area. */
  const insertedRows = () => matching(/INSERT OR REPLACE INTO fish_regulatory_areas/).map(({ params }) => params)

  return { batch, batches, db, directStatements, insertedRows, matching, statements }
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

    it('sends the whole replacement as a single batch, not a statement per area', async () => {
      const { batch, batches, db, directStatements } = createRecordingDb()

      await createSqliteFishRegulatoryAreaRepository(db).replaceForSeaFronts(
        Array.from({ length: 50 }, (_, index) => buildArea(index + 1))
      )

      expect(batches).toHaveLength(1)
      // two deletes + one insert carrying all 50 parameter sets
      expect(batch()).toHaveLength(2)
      expect(directStatements).toHaveLength(0)
    })

    it('uses INSERT OR REPLACE so a re-sync does not collide on the primary key', async () => {
      const { db, matching } = createRecordingDb()

      await createSqliteFishRegulatoryAreaRepository(db).replaceForSeaFronts([buildArea(1)])

      expect(matching(/INSERT INTO fish_regulatory_areas/)).toHaveLength(0)
      expect(matching(/INSERT OR REPLACE INTO fish_regulatory_areas/)).toHaveLength(1)
    })

    it('keeps both delete predicates so a row with no type is left alone', async () => {
      const { db, matching } = createRecordingDb()

      await createSqliteFishRegulatoryAreaRepository(db).replaceForSeaFronts([buildArea(1)])

      expect(matching(/^\s*DELETE FROM fish_regulatory_areas\s*$/)).toHaveLength(1)
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

    it('assigns a fill colour', async () => {
      const { db, insertedRows } = createRecordingDb()

      await createSqliteFishRegulatoryAreaRepository(db).replaceForSeaFronts([buildArea(1)])

      expect(insertedRows()[0]?.[4]).toEqual(expect.any(String))
    })

    it('still prunes, but binds no insert, when nothing is published', async () => {
      const { batch, db, matching } = createRecordingDb()

      await createSqliteFishRegulatoryAreaRepository(db).replaceForSeaFronts([])

      expect(batch()).toHaveLength(1)
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
