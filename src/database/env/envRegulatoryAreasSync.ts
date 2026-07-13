import type { DB } from "@op-engineering/op-sqlite";

import { BoundingBox } from "@/types/mapTypes";
import {
  ENV_REGULATORY_AREAS_API_URL,
  ENV_REGULATORY_AREAS_TABLE,
} from "../db.schema";

type ApiRow = {
  __id: number;
  type_de_reglementation: string;
  thematique: string;
  zone: string;
  regulations: string;
  wkt: string;
};

type ApiResponse = {
  data: ApiRow[];
  links: {
    next: string | undefined;
  };
};

function calculateBboxFromWkt(
  wkt: string | undefined,
): BoundingBox | undefined {
  if (!wkt) return undefined;

  try {
    const wktTrimmed = wkt.trim();
    const coords: [number, number][] = [];

    // Extract all coordinates from WKT
    const coordMatches = wktTrimmed.match(/-?\d+\.?\d*\s+-?\d+\.?\d*/g);
    if (!coordMatches) return undefined;

    for (const match of coordMatches) {
      const [lon, lat] = match.split(" ").map(Number);
      if (!isNaN(lon) && !isNaN(lat)) {
        coords.push([lon, lat]);
      }
    }

    if (coords.length === 0) return undefined;

    const lons = coords.map((c) => c[0]);
    const lats = coords.map((c) => c[1]);

    return {
      minLon: Math.min(...lons),
      maxLon: Math.max(...lons),
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
    };
  } catch {
    return undefined;
  }
}

async function fetchAllEnvRegulatoryAreas() {
  const rows: ApiRow[] = [];
  let nextUrl: string | undefined = ENV_REGULATORY_AREAS_API_URL;

  while (nextUrl) {
    const response = await fetch(nextUrl);

    if (!response.ok) {
      throw new Error(
        `Unable to load env regulatory areas: ${response.status}`,
      );
    }

    const payload = (await response.json()) as ApiResponse;
    rows.push(...payload.data);
    nextUrl = payload.links.next;
  }

  return rows;
}

export async function syncEnvRegulatoryAreas(db: DB) {
  const rows = await fetchAllEnvRegulatoryAreas();

  await db.transaction(async (tx) => {
    await tx.execute(`DELETE FROM ${ENV_REGULATORY_AREAS_TABLE};`);

    for (const row of rows) {
      const bbox = calculateBboxFromWkt(row.wkt);

      await tx.execute(
        `
          INSERT INTO ${ENV_REGULATORY_AREAS_TABLE} (
            id,
            type,
            theme,
            zone,
            regulations,
            wkt,
            bbox_min_lon,
            bbox_min_lat,
            bbox_max_lon,
            bbox_max_lat
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          row.__id,
          row.type_de_reglementation,
          row.thematique,
          row.zone,
          row.reglementations,
          row.wkt,
          bbox?.minLon ?? null,
          bbox?.minLat ?? null,
          bbox?.maxLon ?? null,
          bbox?.maxLat ?? null,
        ],
      );
    }
  });
}
