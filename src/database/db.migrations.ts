import type { DB, Transaction } from '@op-engineering/op-sqlite'

import { DATABASE_VERSION, ENV_REGULATORY_AREAS_TABLE, FISH_REGULATORY_AREAS_TABLE } from './db.schema'

type Migration = {
  version: number
  run: (tx: Transaction) => Promise<void>
}

/**
 * `ALTER TABLE ADD COLUMN` throws when the column is already there, which happens on installs
 * whose first migration already created the table with it.
 */
async function addColumnIfMissing(tx: Transaction, table: string, column: string, definition: string) {
  const result = await tx.execute(`PRAGMA table_info(${table})`)
  const exists = result.rows.some(row => row.name === column)

  if (exists) {
    return
  }

  await tx.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`)
}

const migrations: Migration[] = [
  {
    run: async tx => {
      await tx.execute(
        `
          CREATE TABLE IF NOT EXISTS ${ENV_REGULATORY_AREAS_TABLE} (
            id INTEGER PRIMARY KEY NOT NULL,
            fill_color TEXT,
            url TEXT,
            layer_name TEXT,
            facade TEXT,
            ref_reg TEXT,
            date TEXT,
            date_fin TEXT,
            type TEXT,
            geojson TEXT,
            resume TEXT,
            plan TEXT,
            poly_name TEXT,
            authorization_periods TEXT,
            prohibition_periods TEXT,
            additional_ref_reg TEXT,
            themes TEXT,
            location TEXT,
            edition TEXT,
            bbox_min_lon REAL,
            bbox_min_lat REAL,
            bbox_max_lon REAL,
            bbox_max_lat REAL,
            total_by_group INTEGER
          )
        `
      )
      await tx.execute(
        `
          CREATE INDEX IF NOT EXISTS idx_env_bbox_min_lon
          ON ${ENV_REGULATORY_AREAS_TABLE} (bbox_min_lon)
        `
      )
      await tx.execute(
        `
          CREATE INDEX IF NOT EXISTS idx_env_bbox_max_lon
          ON ${ENV_REGULATORY_AREAS_TABLE} (bbox_max_lon)
        `
      )
      await tx.execute(
        `
          CREATE INDEX IF NOT EXISTS idx_env_bbox_min_lat
          ON ${ENV_REGULATORY_AREAS_TABLE} (bbox_min_lat)
        `
      )
      await tx.execute(
        `
          CREATE INDEX IF NOT EXISTS idx_env_bbox_max_lat
          ON ${ENV_REGULATORY_AREAS_TABLE} (bbox_max_lat)
        `
      )

      await tx.execute(`
        CREATE TABLE IF NOT EXISTS ${FISH_REGULATORY_AREAS_TABLE} (
          id INTEGER PRIMARY KEY NOT NULL,
          fill_color TEXT,
          type TEXT,
          theme TEXT,
          zone TEXT,
          regulations TEXT,
          geojson TEXT,
          bbox_min_lon REAL,
          bbox_min_lat REAL,
          bbox_max_lon REAL,
          bbox_max_lat REAL,
          total_by_group INTEGER
        )
      `)

      await tx.execute(
        `
          CREATE INDEX IF NOT EXISTS idx_fish_bbox_min_lon
          ON ${FISH_REGULATORY_AREAS_TABLE} (bbox_min_lon)
        `
      )
      await tx.execute(
        `
          CREATE INDEX IF NOT EXISTS idx_fish_bbox_max_lon
          ON ${FISH_REGULATORY_AREAS_TABLE} (bbox_max_lon)
        `
      )
      await tx.execute(
        `
          CREATE INDEX IF NOT EXISTS idx_fish_bbox_min_lat
          ON ${FISH_REGULATORY_AREAS_TABLE} (bbox_min_lat)
        `
      )
      await tx.execute(
        `
          CREATE INDEX IF NOT EXISTS idx_fish_bbox_max_lat
          ON ${FISH_REGULATORY_AREAS_TABLE} (bbox_max_lat)
        `
      )
    },
    version: 1
  },
  {
    run: async tx => {
      // Added to version 1 after it had already shipped, so existing databases never got the column.
      await addColumnIfMissing(tx, ENV_REGULATORY_AREAS_TABLE, 'total_by_group', 'INTEGER')
      await addColumnIfMissing(tx, FISH_REGULATORY_AREAS_TABLE, 'total_by_group', 'INTEGER')
    },
    version: 2
  }
]

async function getSchemaVersion(db: DB) {
  const result = await db.execute('PRAGMA user_version')
  const version = result.rows[0]?.user_version

  return typeof version === 'number' ? version : Number(version ?? 0)
}

async function setSchemaVersion(tx: Transaction, version: number) {
  await tx.execute(`PRAGMA user_version = ${version}`)
}

export async function migrateDatabase(db: DB) {
  const currentVersion = await getSchemaVersion(db)
  const pendingMigrations = migrations.filter(
    migration => migration.version > currentVersion && migration.version <= DATABASE_VERSION
  )

  if (pendingMigrations.length === 0) {
    return
  }

  await db.transaction(async tx => {
    for (const migration of pendingMigrations) {
      await migration.run(tx)
      await setSchemaVersion(tx, migration.version)
    }
  })
}
