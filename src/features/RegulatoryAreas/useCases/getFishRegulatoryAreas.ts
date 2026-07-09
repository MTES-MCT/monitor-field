import { RegulatoryAreaListItem } from "@contexts/RegulatoryAreasContext";
import { getDatabase } from "@database/db";
import { getFishRegulatoryAreasQuery } from "@database/fish/getFishRegulatoryAreasQuery";

import {
  BoundingBox,
  GeoJSONCollection,
  GeoJSONFeature,
} from "@/types/mapTypes";

export async function getFishRegulatoryAreas(
  bbox: BoundingBox,
  setTotalCount: (count: number | undefined) => void,
  setRegulatoryAreas: (areas: RegulatoryAreaListItem[]) => void,
): Promise<GeoJSONCollection> {
  const db = await getDatabase();

  const fetchedAreas = await getFishRegulatoryAreasQuery(db, bbox);

  const features: GeoJSONFeature[] = [];
  const listItems: RegulatoryAreaListItem[] = [];

  setTotalCount(fetchedAreas.length);

  for (const area of fetchedAreas) {
    listItems.push({
      id: area.id,
      type: area.type,
      theme: area.theme,
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

    // TODO(13/07/2026): add schema for regulatory areas 
    const feature = JSON.parse(area.geojson ?? "");
    if (!feature) {
      continue;
    }

    feature.properties = {
      id: area.id,
      type: area.type,
      theme: area.theme,
      zone: area.zone,
      fillColor: area.fill_color,
      isSelected: false,
    };
    features.push(feature);
  }

  setRegulatoryAreas(listItems);

  return { type: "FeatureCollection", features };
}
