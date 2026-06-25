import type { DB } from "@op-engineering/op-sqlite";

import { ENV_REGULATORY_AREAS_TABLE } from "@/lib/db.schema";

export type EnvRegulatoryArea = {
  id: number;
  type_de_reglementation: string | null;
  thematique: string | null;
  zone: string | null;
  reglementations: string | null;
  wkt: string | null;
  bbox_min_lon: number | null;
  bbox_min_lat: number | null;
  bbox_max_lon: number | null;
  bbox_max_lat: number | null;
};

export type BoundingBox = {
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
};

export async function fetchEnvRegulatoryAreasByBbox(
  db: DB,
  bbox: BoundingBox,
  limit: number = 100,
  offset: number = 0,
): Promise<EnvRegulatoryArea[]> {
  const { minLon, minLat, maxLon, maxLat } = bbox;

  const result = await db.execute(
    `
      SELECT * FROM ${ENV_REGULATORY_AREAS_TABLE}
      WHERE bbox_max_lon >= ?
        AND bbox_min_lon <= ?
        AND bbox_max_lat >= ?
        AND bbox_min_lat <= ?
      ORDER BY id
      LIMIT ?
      OFFSET ?
    `,
    [minLon, maxLon, minLat, maxLat, limit, offset],
  );

  return result.rows as EnvRegulatoryArea[];
}
