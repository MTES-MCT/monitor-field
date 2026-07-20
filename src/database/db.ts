import { openAsync, type DB } from '@op-engineering/op-sqlite'

import { migrateDatabase } from './db.migrations'
import { DATABASE_NAME } from './db.schema'

let databasePromise: Promise<DB> | null = null

async function createDatabase() {
  const db = await openAsync({ name: DATABASE_NAME })

  await db.execute('PRAGMA journal_mode = WAL')
  await db.execute('PRAGMA foreign_keys = ON')
  await migrateDatabase(db)

  return db
}

export function getDatabase() {
  if (!databasePromise) {
    databasePromise = createDatabase()
  }

  return databasePromise
}

export async function closeDatabase() {
  const db = await getDatabase()
  await db.closeAsync()
  databasePromise = null
}
