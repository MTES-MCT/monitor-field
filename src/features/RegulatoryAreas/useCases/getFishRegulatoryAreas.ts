import {
  Filters,
  RegulatoryAreaListItem,
} from "@contexts/RegulatoryAreasContext";
import { getFishRegulatoryAreasQuery } from "@database/fish/getFishRegulatoryAreasQuery";
import { matchesRegulatoryAreaSearch } from "@features/RegulatoryAreas/RegulatoryAreasList/utils";

import {
  BoundingBox,
  GeoJSONCollection,
  GeoJSONFeature,
} from "@/types/mapTypes";
import { getDatabase } from "@database/db";

export type FishRegulatoryAreasResult = {
  geoJSON: GeoJSONCollection;
  listItems: RegulatoryAreaListItem[];
};

export async function getFishRegulatoryAreas(
  bbox: BoundingBox,
  filters: Filters,
): Promise<FishRegulatoryAreasResult> {
  const db = await getDatabase();

  const fetchedAreas = await getFishRegulatoryAreasQuery(db, bbox);

  const features: GeoJSONFeature[] = [];
  const listItems: RegulatoryAreaListItem[] = [];

  for (const area of fetchedAreas) {
    if (matchesRegulatoryAreaSearch(area, filters.searchQuery)) {
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
  }

  return {
    geoJSON: { type: "FeatureCollection", features },
    listItems,
  };
}
