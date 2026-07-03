import type { DB } from "@op-engineering/op-sqlite";

import { monitorFishConfig } from "@/config/appModes/monitorfish.config";
import {
  FISH_REGULATORY_AREAS_API_URL,
  FISH_REGULATORY_AREAS_TABLE,
} from "@/lib/db.schema";
import { BoundingBox } from "@/types/MapTypes";
import {
  normalizeFeatureProperty,
  stringToArrayItem,
} from "@/utils/layersStyle";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";
import wkt from "wkt";

type ApiRow = {
  id: number;
  type_de_reglementation: string;
  thematique: string;
  zone: string;
  reglementations: string;
  wkt: string;
};

type ApiResponse = {
  data: ApiRow[];
  links: {
    next: string | null;
  };
};

function calculateBboxFromWkt(wkt: string | null): BoundingBox | null {
  if (!wkt) return null;

  try {
    const wktTrimmed = wkt.trim();
    const coords: [number, number][] = [];

    // Extract all coordinates from WKT
    const coordMatches = wktTrimmed.match(/-?\d+\.?\d*\s+-?\d+\.?\d*/g);
    if (!coordMatches) return null;

    for (const match of coordMatches) {
      const [lon, lat] = match.split(" ").map(Number);
      if (!isNaN(lon) && !isNaN(lat)) {
        coords.push([lon, lat]);
      }
    }

    if (coords.length === 0) return null;

    const lons = coords.map((c) => c[0]);
    const lats = coords.map((c) => c[1]);

    return {
      minLon: Math.min(...lons),
      maxLon: Math.max(...lons),
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
    };
  } catch {
    return null;
  }
}

async function fetchAllFishRegulatoryAreas() {
  const rows: ApiRow[] = [];
  let nextUrl: string | null = FISH_REGULATORY_AREAS_API_URL;
  while (nextUrl) {
    const response = await fetch(nextUrl);

    if (!response.ok) {
      throw new Error(
        `Unable to load fish regulatory areas: ${response.status}`,
      );
    }

    const payload = (await response.json()) as ApiResponse;
    rows.push(...payload.data);
    nextUrl = payload.links.next;
  }

  return rows;
}

function buildFeatureColorKey(row: ApiRow): string {
  const id = normalizeFeatureProperty(row.id);
  const type = normalizeFeatureProperty(row.type_de_reglementation);
  const regulatoryAreaTheme = normalizeFeatureProperty(row.thematique);

  return `${id}-${type}-${regulatoryAreaTheme}`;
}

export async function syncFishRegulatoryAreas(db: DB) {
  const palette = monitorFishConfig?.colors;

  const existingCountResult = await db.execute(
    `SELECT COUNT(*) AS count FROM ${FISH_REGULATORY_AREAS_TABLE}`,
  );
  const existingCount = Number(existingCountResult.rows?.[0]?.count ?? 0);
  const lastUpdate = await AsyncStorage.getItem(
    "fish-regulatory-areas-last-update",
  );
  const sevenDaysAgo = dayjs().subtract(7, "day").format("YYYY-MM-DD");
  const shouldSkipFetch =
    existingCount > 0 &&
    !!lastUpdate &&
    dayjs(lastUpdate) > dayjs(sevenDaysAgo);

  if (shouldSkipFetch) {
    return;
  }

  const rows = await fetchAllFishRegulatoryAreas();

  if (!rows || rows.length === 0) {
    console.warn("No fish regulatory areas to sync");
    return;
  }

  try {
    await db.transaction(async (tx) => {
      await tx.execute(`DELETE FROM ${FISH_REGULATORY_AREAS_TABLE};`);
      for (const row of rows) {
        const bbox = calculateBboxFromWkt(row.wkt);
        const colorKey = buildFeatureColorKey(row);
        const fillColor = stringToArrayItem(colorKey, palette) ?? palette[0];
        const geojson = row.wkt ? wkt.parse(row.wkt) : null;
        await tx.execute(
          `
          INSERT INTO ${FISH_REGULATORY_AREAS_TABLE} (
            id,
            type_de_reglementation,
            thematique,
            zone,
            fill_color,
            reglementations,
            wkt,
            geojson,
            bbox_min_lon,
            bbox_min_lat,
            bbox_max_lon,
            bbox_max_lat
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
          [
            row.id,
            row.type_de_reglementation,
            row.thematique,
            row.zone,
            fillColor,
            row.reglementations,
            row.wkt,
            geojson ? JSON.stringify(geojson) : null,
            bbox?.minLon ?? null,
            bbox?.minLat ?? null,
            bbox?.maxLon ?? null,
            bbox?.maxLat ?? null,
          ],
        );
      }
    });
  } catch (error) {
    console.error("Transaction failed during fish sync:", error);
    throw error;
  }

  await AsyncStorage.setItem(
    "fish-regulatory-areas-last-update",
    String(dayjs().format("YYYY-MM-DD")),
  );
}
