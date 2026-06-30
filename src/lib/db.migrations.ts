import type { DB, Transaction } from "@op-engineering/op-sqlite";

import {
  DATABASE_VERSION,
  ENV_REGULATORY_AREAS_TABLE,
  FISH_REGULATORY_AREAS_RTREE_TABLE,
  FISH_REGULATORY_AREAS_TABLE,
} from "@/lib/db.schema";

type Migration = {
  version: number;
  run: (tx: Transaction) => Promise<void>;
};

const migrations: Migration[] = [
  {
    version: 1,
    run: async (tx) => {
      await tx.execute(
        `
          CREATE TABLE IF NOT EXISTS ${ENV_REGULATORY_AREAS_TABLE} (
            id INTEGER PRIMARY KEY NOT NULL
          )
        `,
      );

      await tx.execute(`
        CREATE TABLE IF NOT EXISTS ${FISH_REGULATORY_AREAS_TABLE} (
          id INTEGER PRIMARY KEY NOT NULL,
          type_de_reglementation TEXT,
          thematique TEXT,
          zone TEXT,
          reglementations TEXT,
          wkt TEXT,
          bbox_min_lon REAL,
          bbox_min_lat REAL,
          bbox_max_lon REAL,
          bbox_max_lat REAL,
          wkt_z_lt5 TEXT,
          wkt_z_lt7 TEXT,
          wkt_z_lt9 TEXT,
          wkt_z_lt11 TEXT
        )
      `);

      await tx.execute(
        `
          CREATE INDEX IF NOT EXISTS idx_fish_bbox_min_lon
          ON ${FISH_REGULATORY_AREAS_TABLE} (bbox_min_lon)
        `,
      );
      await tx.execute(
        `
          CREATE INDEX IF NOT EXISTS idx_fish_bbox_max_lon
          ON ${FISH_REGULATORY_AREAS_TABLE} (bbox_max_lon)
        `,
      );
      await tx.execute(
        `
          CREATE INDEX IF NOT EXISTS idx_fish_bbox_min_lat
          ON ${FISH_REGULATORY_AREAS_TABLE} (bbox_min_lat)
        `,
      );
      await tx.execute(
        `
          CREATE INDEX IF NOT EXISTS idx_fish_bbox_max_lat
          ON ${FISH_REGULATORY_AREAS_TABLE} (bbox_max_lat)
        `,
      );
      try {
        await tx.execute(
          `
              CREATE VIRTUAL TABLE IF NOT EXISTS ${FISH_REGULATORY_AREAS_RTREE_TABLE}
              USING rtree(id, min_lon, max_lon, min_lat, max_lat)
            `,
        );
        await tx.execute(
          `
              INSERT INTO ${FISH_REGULATORY_AREAS_RTREE_TABLE} (id, min_lon, max_lon, min_lat, max_lat)
              SELECT id, bbox_min_lon, bbox_max_lon, bbox_min_lat, bbox_max_lat
              FROM ${FISH_REGULATORY_AREAS_TABLE}
              WHERE bbox_min_lon IS NOT NULL
                AND bbox_max_lon IS NOT NULL
                AND bbox_min_lat IS NOT NULL
                AND bbox_max_lat IS NOT NULL
            `,
        );
      } catch (error) {
        console.warn(
          "RTree module unavailable, using B-Tree bbox indexes only",
          error,
        );
      }
    },
  },
];

async function getSchemaVersion(db: DB) {
  const result = await db.execute("PRAGMA user_version;");
  const version = result.rows[0]?.user_version;

  return typeof version === "number" ? version : Number(version ?? 0);
}

async function setSchemaVersion(tx: Transaction, version: number) {
  await tx.execute(`PRAGMA user_version = ${version};`);
}

export async function migrateDatabase(db: DB) {
  const currentVersion = await getSchemaVersion(db);
  const pendingMigrations = migrations.filter(
    (migration) =>
      migration.version > currentVersion &&
      migration.version <= DATABASE_VERSION,
  );

  if (pendingMigrations.length === 0) {
    return;
  }

  await db.transaction(async (tx) => {
    for (const migration of pendingMigrations) {
      await migration.run(tx);
      await setSchemaVersion(tx, migration.version);
    }
  });
}
