import type { DB } from "@op-engineering/op-sqlite";

import { FISH_REGULATORY_AREAS_TABLE } from "@/lib/db.schema";

export type FishRegulatoryArea = {
  id: number;
  type_de_reglementation: string | undefined;
  thematique: string | undefined;
  zone: string | undefined;
  reglementations: string | undefined;
  wkt: string | undefined;
  bbox_min_lon: number | undefined;
  bbox_min_lat: number | undefined;
  bbox_max_lon: number | undefined;
  bbox_max_lat: number | undefined;
};

export type BoundingBox = {
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
};

export async function fetchFishRegulatoryAreasByBbox(
  db: DB,
  bbox: BoundingBox,
  limit: number = 100,
  offset: number = 0,
): Promise<FishRegulatoryArea[]> {
  const { minLon, minLat, maxLon, maxLat } = bbox;

  const result = await db.execute(
    `
      SELECT * FROM ${FISH_REGULATORY_AREAS_TABLE}
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

  return result.rows as FishRegulatoryArea[];
}
