import type { DB } from "@op-engineering/op-sqlite";

import {
  ENV_REGULATORY_AREAS_API_URL,
  ENV_REGULATORY_AREAS_TABLE,
} from "@/lib/db.schema";
import { BoundingBox } from "@/types/MapTypes";

type ApiRow = {
  __id: number;
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

async function fetchAllEnvRegulatoryAreas() {
  const rows: ApiRow[] = [];
  let nextUrl: string | null = ENV_REGULATORY_AREAS_API_URL;

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
            type_de_reglementation,
            thematique,
            zone,
            reglementations,
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
