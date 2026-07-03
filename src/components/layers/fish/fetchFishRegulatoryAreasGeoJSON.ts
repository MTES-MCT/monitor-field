import { getDatabase } from "@/lib/db";
import { fetchFishRegulatoryAreasByBbox } from "@/lib/fish/fishRegulatoryAreasQueries";
import {
  BoundingBox,
  GeoJSONCollection,
  GeoJSONFeature,
  Geometry,
} from "@/types/MapTypes";

export async function fetchFishRegulatoryAreasGeoJSON(
  bbox: BoundingBox,
  zoom: number,
  setTotalCount: (count: number | undefined) => void,
): Promise<GeoJSONCollection> {
  const db = await getDatabase();

  const fetchedAreas = await fetchFishRegulatoryAreasByBbox(db, bbox, zoom);

  const features: GeoJSONFeature[] = [];

  setTotalCount(fetchedAreas.length);
  for (const area of fetchedAreas) {
    const geom = JSON.parse(area.geojson ?? "") as Geometry;

    if (!geom) {
      continue;
    }

    const feature = {
      type: "Feature" as const,
      geometry: geom,
      properties: {},
    };

    feature.properties = {
      id: area.id,
      type_de_reglementation: area.type_de_reglementation,
      thematique: area.thematique,
      zone: area.zone,
      fillColor: area.fill_color,
    };
    features.push(feature);
  }

  return { type: "FeatureCollection", features };
}
