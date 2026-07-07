import { RegulatoryAreaListItem } from "@/contexts/RegulatoryAreasContext";
import { getDatabase } from "@/lib/db";
import { fetchFishRegulatoryAreasByBbox } from "@/lib/fish/fishRegulatoryAreasQueries";
import {
  BoundingBox,
  GeoJSONCollection,
  GeoJSONFeature,
} from "@/types/MapTypes";

export async function fetchFishRegulatoryAreasGeoJSON(
  bbox: BoundingBox,
  zoom: number,
  setTotalCount: (count: number | undefined) => void,
  setRegulatoryAreas: (areas: RegulatoryAreaListItem[]) => void,
): Promise<GeoJSONCollection> {
  const db = await getDatabase();

  const fetchedAreas = await fetchFishRegulatoryAreasByBbox(db, bbox, zoom);

  const features: GeoJSONFeature[] = [];
  const listItems: RegulatoryAreaListItem[] = [];

  setTotalCount(fetchedAreas.length);

  for (const area of fetchedAreas) {
    listItems.push({
      id: area.id,
      type: area.type_de_reglementation,
      theme: area.thematique,
      zone: area.zone,
      bbox: {
        minLon: area.bbox_min_lon,
        minLat: area.bbox_min_lat,
        maxLon: area.bbox_max_lon,
        maxLat: area.bbox_max_lat,
      },
      fillColor: area.fill_color,
      isSelected: false,
    });

    const feature = JSON.parse(area.geojson ?? "");
    if (!feature) {
      continue;
    }

    feature.properties = {
      id: area.id,
      type_de_reglementation: area.type_de_reglementation,
      thematique: area.thematique,
      zone: area.zone,
      fillColor: area.fill_color,
      isSelected: false,
    };
    features.push(feature);
  }

  setRegulatoryAreas(listItems);

  return { type: "FeatureCollection", features };
}
