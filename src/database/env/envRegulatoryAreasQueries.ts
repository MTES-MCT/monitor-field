import type { DB } from "@op-engineering/op-sqlite";

import { BoundingBox } from "@types/MapTypes";
import { ENV_REGULATORY_AREAS_TABLE } from "../db.schema";

export type EnvRegulatoryArea = {
  id: number;
  type: string | undefined;
  theme: string | undefined;
  zone: string | undefined;
  reglementations: string | undefined;
  wkt: string | undefined;
  bbox_min_lon: number | undefined;
  bbox_min_lat: number | undefined;
  bbox_max_lon: number | undefined;
  bbox_max_lat: number | undefined;
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
