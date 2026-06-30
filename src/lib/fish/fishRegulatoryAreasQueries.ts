import type { DB } from "@op-engineering/op-sqlite";

import {
  FISH_REGULATORY_AREAS_RTREE_TABLE,
  FISH_REGULATORY_AREAS_TABLE,
} from "@/lib/db.schema";
import { BoundingBox } from "@/types/MapTypes";

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

export async function fetchFishRegulatoryAreasByBbox(
  db: DB,
  bbox: BoundingBox,
  zoom: number,
): Promise<FishRegulatoryArea[]> {
  const { minLon, minLat, maxLon, maxLat } = bbox;

  try {
    const rtreeResult = await db.execute(
      `
        SELECT
          fish.id,
          fish.type_de_reglementation,
          fish.thematique,
          fish.zone,
          CASE
            WHEN ? < 5 THEN COALESCE(fish.wkt_z_lt5, fish.wkt)
            WHEN ? < 7 THEN COALESCE(fish.wkt_z_lt7, fish.wkt)
            WHEN ? < 9 THEN COALESCE(fish.wkt_z_lt9, fish.wkt)
            WHEN ? < 11 THEN COALESCE(fish.wkt_z_lt11, fish.wkt)
            ELSE fish.wkt
          END AS wkt,
          fish.bbox_min_lon,
          fish.bbox_min_lat,
          fish.bbox_max_lon,
          fish.bbox_max_lat
        FROM ${FISH_REGULATORY_AREAS_RTREE_TABLE} AS idx
        INNER JOIN ${FISH_REGULATORY_AREAS_TABLE} AS fish
          ON fish.id = idx.id
        WHERE idx.max_lon >= ?
          AND idx.min_lon <= ?
          AND idx.max_lat >= ?
          AND idx.min_lat <= ?
        ORDER BY fish.id
      `,
      [zoom, zoom, zoom, zoom, minLon, maxLon, minLat, maxLat],
    );

    return rtreeResult.rows as FishRegulatoryArea[];
  } catch {
    const result = await db.execute(
      `
        SELECT
          id,
          type_de_reglementation,
          thematique,
          zone,
          CASE
            WHEN ? < 5 THEN COALESCE(wkt_z_lt5, wkt)
            WHEN ? < 7 THEN COALESCE(wkt_z_lt7, wkt)
            WHEN ? < 9 THEN COALESCE(wkt_z_lt9, wkt)
            WHEN ? < 11 THEN COALESCE(wkt_z_lt11, wkt)
            ELSE wkt
          END AS wkt,
          bbox_min_lon,
          bbox_min_lat,
          bbox_max_lon,
          bbox_max_lat
        FROM ${FISH_REGULATORY_AREAS_TABLE}
        WHERE bbox_max_lon >= ?
          AND bbox_min_lon <= ?
          AND bbox_max_lat >= ?
          AND bbox_min_lat <= ?
        ORDER BY id
      `,
      [zoom, zoom, zoom, zoom, minLon, maxLon, minLat, maxLat],
    );

    return result.rows as FishRegulatoryArea[];
  }
}
