import type { DB } from "@op-engineering/op-sqlite";

import { BoundingBox } from "@types/MapTypes";
import { FISH_REGULATORY_AREAS_TABLE } from "../db.schema";

export type FishRegulatoryArea = {
  id: number;
  type: string;
  theme: string;
  zone: string;
  regulations: string;
  wkt: string;
  geojson: string;
  bbox_min_lon: number;
  bbox_min_lat: number;
  bbox_max_lon: number;
  bbox_max_lat: number;
  fill_color: string;
};

export async function getFishRegulatoryAreasQuery(
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
          fish.type,
          fish.theme,
          fish.zone,
          fish.regulations,
          fish.geojson,
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
