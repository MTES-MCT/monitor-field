import type { DB } from "@op-engineering/op-sqlite";

import { FISH_REGULATORY_AREAS_TABLE } from "@/lib/db.schema";
import { BoundingBox } from "@/types/MapTypes";

export type FishRegulatoryArea = {
  id: number;
  type_de_reglementation: string | undefined;
  thematique: string | undefined;
  zone: string | undefined;
  reglementations: string | undefined;
  wkt: string | undefined;
  geojson: string | undefined;
  bbox_min_lon: number | undefined;
  bbox_min_lat: number | undefined;
  bbox_max_lon: number | undefined;
  bbox_max_lat: number | undefined;
  fill_color: string | undefined;
};

export async function fetchFishRegulatoryAreasCount(db: DB) {
  try {
    return await db.execute(
      `
        SELECT * 
        FROM ${FISH_REGULATORY_AREAS_TABLE}
        LIMIT 1
      `,
    );
  } catch (error) {
    console.error("Error fetching fish regulatory areas count:", error);
    throw error;
  }
}

export async function fetchFishRegulatoryAreasByBbox(
  db: DB,
  bbox: BoundingBox,
  zoom: number,
): Promise<FishRegulatoryArea[]> {
  const { minLon, minLat, maxLon, maxLat } = bbox;

  try {
    const result = await db.execute(
      `
        SELECT
          fish.id,
          fish.type_de_reglementation,
          fish.thematique,
          fish.zone,
          wkt,
          geojson,
          fish.bbox_min_lon,
          fish.bbox_min_lat,
          fish.bbox_max_lon,
          fish.bbox_max_lat,
          fish.fill_color
        FROM ${FISH_REGULATORY_AREAS_TABLE} AS fish
        WHERE fish.bbox_max_lon >= ?
          AND fish.bbox_min_lon <= ?
          AND fish.bbox_max_lat >= ?
          AND fish.bbox_min_lat <= ?
        ORDER BY fish.id
      `,
      [minLon, maxLon, minLat, maxLat],
    );

    return result.rows as FishRegulatoryArea[];
  } catch (error) {
    console.warn("Error fetching areas", error);
    return [];
  }
}
