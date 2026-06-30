import type { DB } from "@op-engineering/op-sqlite";

import {
  FISH_REGULATORY_AREAS_API_URL,
  FISH_REGULATORY_AREAS_RTREE_TABLE,
  FISH_REGULATORY_AREAS_TABLE,
} from "@/lib/db.schema";
import { parseWtkToGeojson } from "@/utils/parseWtkToGeojson";

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

type BboxResult = {
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
};

type Position = number[];
type Geometry =
  | {
      type: "Polygon";
      coordinates: Position[][];
    }
  | {
      type: "MultiPolygon";
      coordinates: Position[][][];
    };

async function isRtreeSupported(db: DB): Promise<boolean> {
  try {
    const result = await db.execute(
      "SELECT sqlite_compileoption_used('ENABLE_RTREE') AS enabled",
    );
    const enabled = result.rows?.[0]?.enabled;

    if (enabled === 1 || enabled === "1") {
      return true;
    }
  } catch {
    // Ignore and fallback below.
  }

  try {
    await db.execute(
      "CREATE VIRTUAL TABLE IF NOT EXISTS __rtree_probe USING rtree(id, min_x, max_x, min_y, max_y)",
    );
    await db.execute("DROP TABLE IF EXISTS __rtree_probe");
    return true;
  } catch {
    return false;
  }
}

function simplifyRing(ring: Position[], step: number): Position[] {
  if (step <= 1 || ring.length <= 4) {
    return ring;
  }

  const isClosed =
    ring.length > 1 &&
    ring[0]?.[0] === ring[ring.length - 1]?.[0] &&
    ring[0]?.[1] === ring[ring.length - 1]?.[1];
  const ringWithoutClosure = isClosed ? ring.slice(0, -1) : [...ring];

  const kept: Position[] = [];
  for (let i = 0; i < ringWithoutClosure.length; i += step) {
    const point = ringWithoutClosure[i];
    if (point) {
      kept.push(point);
    }
  }

  const lastPoint = ringWithoutClosure[ringWithoutClosure.length - 1];
  if (lastPoint && kept[kept.length - 1] !== lastPoint) {
    kept.push(lastPoint);
  }

  while (kept.length < 4 && ringWithoutClosure.length > kept.length) {
    const nextPoint = ringWithoutClosure[kept.length];
    if (!nextPoint) {
      break;
    }
    kept.push(nextPoint);
  }

  if (isClosed && kept.length > 0) {
    const first = kept[0];
    const end = kept[kept.length - 1];
    if (first && end && (first[0] !== end[0] || first[1] !== end[1])) {
      kept.push([first[0], first[1]]);
    }
  }

  return kept;
}

function simplifyGeometry(geometry: Geometry, step: number): Geometry {
  if (step <= 1) {
    return geometry;
  }

  if (geometry.type === "Polygon") {
    return {
      type: "Polygon",
      coordinates: geometry.coordinates.map((ring) => simplifyRing(ring, step)),
    };
  }

  return {
    type: "MultiPolygon",
    coordinates: geometry.coordinates.map((polygon) =>
      polygon.map((ring) => simplifyRing(ring, step)),
    ),
  };
}

function formatPosition(position: Position): string {
  return `${position[0]} ${position[1]}`;
}

function polygonToWktCoordinates(coordinates: Position[][]): string {
  const rings = coordinates.map(
    (ring) => `(${ring.map(formatPosition).join(",")})`,
  );
  return `(${rings.join(",")})`;
}

function geometryToWkt(geometry: Geometry): string {
  if (geometry.type === "Polygon") {
    return `POLYGON${polygonToWktCoordinates(geometry.coordinates)}`;
  }

  const polygons = geometry.coordinates.map(
    (polygon) => `${polygonToWktCoordinates(polygon)}`,
  );
  return `MULTIPOLYGON(${polygons.join(",")})`;
}

function buildSimplifiedWkts(wkt: string): {
  wktZLt5: string | null;
  wktZLt7: string | null;
  wktZLt9: string | null;
  wktZLt11: string | null;
} {
  const parsed = parseWtkToGeojson(wkt);
  if (!parsed) {
    return {
      wktZLt5: null,
      wktZLt7: null,
      wktZLt9: null,
      wktZLt11: null,
    };
  }

  const geometry = parsed.geometry as Geometry;
  return {
    wktZLt5: geometryToWkt(simplifyGeometry(geometry, 16)),
    wktZLt7: geometryToWkt(simplifyGeometry(geometry, 8)),
    wktZLt9: geometryToWkt(simplifyGeometry(geometry, 4)),
    wktZLt11: geometryToWkt(simplifyGeometry(geometry, 2)),
  };
}

function calculateBboxFromWkt(wkt: string | null): BboxResult | null {
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

export async function syncFishRegulatoryAreas(db: DB) {
  const rows = await fetchAllFishRegulatoryAreas();
  const rtreeEnabled = await isRtreeSupported(db);

  await db.transaction(async (tx) => {
    await tx.execute(`DELETE FROM ${FISH_REGULATORY_AREAS_TABLE};`);
    if (rtreeEnabled) {
      await tx.execute(`DELETE FROM ${FISH_REGULATORY_AREAS_RTREE_TABLE};`);
    }

    for (const row of rows) {
      const bbox = calculateBboxFromWkt(row.wkt);
      const simplifiedWkts = buildSimplifiedWkts(row.wkt);

      await tx.execute(
        `
          INSERT INTO ${FISH_REGULATORY_AREAS_TABLE} (
            id,
            type_de_reglementation,
            thematique,
            zone,
            reglementations,
            wkt,
            wkt_z_lt5,
            wkt_z_lt7,
            wkt_z_lt9,
            wkt_z_lt11,
            bbox_min_lon,
            bbox_min_lat,
            bbox_max_lon,
            bbox_max_lat
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          row.__id,
          row.type_de_reglementation,
          row.thematique,
          row.zone,
          row.reglementations,
          row.wkt,
          simplifiedWkts.wktZLt5,
          simplifiedWkts.wktZLt7,
          simplifiedWkts.wktZLt9,
          simplifiedWkts.wktZLt11,
          bbox?.minLon ?? null,
          bbox?.minLat ?? null,
          bbox?.maxLon ?? null,
          bbox?.maxLat ?? null,
        ],
      );

      if (rtreeEnabled && bbox) {
        await tx.execute(
          `
            INSERT INTO ${FISH_REGULATORY_AREAS_RTREE_TABLE} (id, min_lon, max_lon, min_lat, max_lat)
            VALUES (?, ?, ?, ?, ?)
          `,
          [row.__id, bbox.minLon, bbox.maxLon, bbox.minLat, bbox.maxLat],
        );
      }
    }
  });
}
