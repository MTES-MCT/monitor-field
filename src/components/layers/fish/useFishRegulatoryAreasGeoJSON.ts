import { useEffect, useState } from "react";

import { getDatabase } from "@/lib/db";
import {
  fetchFishRegulatoryAreasByBbox,
  type BoundingBox,
} from "@/lib/fish/fishRegulatoryAreasQueries";
import { parseWtkToGeojson } from "@/utils/parseWtkToGeojson";

export type Geometry =
  | {
      type: "Polygon";
      coordinates: number[][][];
    }
  | {
      type: "MultiPolygon";
      coordinates: number[][][][];
    };

export type GeoJSONFeature = {
  type: "Feature";
  geometry: Geometry;
  properties: Record<string, unknown>;
};

export type GeoJSONCollection = {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
};

const DEFAULT_FEATURE_LIMIT = 100;
const MAX_COORDINATE_PAIRS = 100_000;
export const DEFAULT_FISH_REGULATORY_AREAS_BBOX: BoundingBox = {
  minLon: -5.5,
  minLat: 42.0,
  maxLon: 8.5,
  maxLat: 51.0,
};

function estimateCoordinatePairCount(wkt: string | undefined): number {
  if (!wkt) return 0;

  const matches = wkt.match(/-?\d+\.?\d*\s+-?\d+\.?\d*/g);
  return matches?.length ?? 0;
}

export function useFishRegulatoryAreasGeoJSON(
  bbox: BoundingBox | undefined,
  limit: number = DEFAULT_FEATURE_LIMIT,
) {
  const [geoJSON, setGeoJSON] = useState<GeoJSONCollection | undefined>(
    undefined,
  );
  const [isLoading, setIsLoading] = useState(Boolean(bbox));

  useEffect(() => {
    if (!bbox) {
      return;
    }

    let isCancelled = false;

    void (async () => {
      try {
        await Promise.resolve();

        if (isCancelled) {
          return;
        }

        setIsLoading(true);
        setGeoJSON(undefined);

        const db = await getDatabase();
        // Load max zones per viewport to avoid memory issues
        const fetchedAreas = await fetchFishRegulatoryAreasByBbox(
          db,
          bbox,
          limit,
          0,
        );

        const features: GeoJSONFeature[] = [];
        let coordinatePairCount = 0;

        for (const area of fetchedAreas) {
          const nextCoordinatePairCount = estimateCoordinatePairCount(area.wkt);

          if (
            features.length > 0 &&
            coordinatePairCount + nextCoordinatePairCount > MAX_COORDINATE_PAIRS
          ) {
            console.warn(
              "Reached fish regulatory areas geometry budget for current bbox",
              {
                featureCount: features.length,
                coordinatePairCount,
                requestedLimit: limit,
              },
            );
            break;
          }

          const feature = parseWtkToGeojson(area.wkt);

          if (!feature) {
            continue;
          }

          coordinatePairCount += nextCoordinatePairCount;
          feature.properties = {
            id: area.id,
            type_de_reglementation: area.type_de_reglementation,
            thematique: area.thematique,
            zone: area.zone,
            reglementations: area.reglementations,
          };
          features.push(feature);
        }
        console.log(
          "features",
          features.length,
          "coordinatePairCount",
          coordinatePairCount,
        );
        if (!isCancelled) {
          setGeoJSON({
            type: "FeatureCollection",
            features,
          });
        }
      } catch (error) {
        if (!isCancelled) {
          console.warn("Failed to load regulatory areas", error);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [bbox, limit]);

  return {
    geoJSON: bbox ? geoJSON : undefined,
    isLoading: bbox ? isLoading : false,
  };
}
