import { getDatabase } from "@/lib/db";
import { fetchFishRegulatoryAreasByBbox } from "@/lib/fish/fishRegulatoryAreasQueries";
import {
  BoundingBox,
  GeoJSONCollection,
  GeoJSONFeature,
} from "@/types/MapTypes";
import { parseWtkToGeojson } from "@/utils/parseWtkToGeojson";

const DEFAULT_FEATURE_LIMIT = 6000;

export async function fetchFishRegulatoryAreasGeoJSON(
  bbox: BoundingBox,
  zoom: number,
  limit: number = DEFAULT_FEATURE_LIMIT,
): Promise<GeoJSONCollection> {
  const db = await getDatabase();
  const fetchedAreas = await fetchFishRegulatoryAreasByBbox(db, bbox, zoom);

  const features: GeoJSONFeature[] = [];

  for (const area of fetchedAreas) {
    if (features.length >= limit) {
      break;
    }

    const feature = parseWtkToGeojson(area.wkt);

    if (!feature) {
      continue;
    }

    feature.properties = {
      id: area.id,
      type_de_reglementation: area.type_de_reglementation,
      thematique: area.thematique,
      zone: area.zone,
    };
    features.push(feature);
  }

  return { type: "FeatureCollection", features };
}
