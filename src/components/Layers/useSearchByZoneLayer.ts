import { useMemo } from "react";

import { useRegulatoryAreasContext } from "@contexts/RegulatoryAreasContext";
import { useTheme } from "@hooks/use-theme";
import type { BoundingBox, GeoJSONFeature, MapLayer } from "@types/MapTypes";

export const searchByZoneIds = {
  source: "search-by-zone-source",
  outlineLayer: "search-by-zone-outline",
};

const SEARCH_ZONE_INSET_RATIO = 0.05;

export type SearchByZoneLayerProps = {
  source:
    | {
        id: string;
        definition: {
          type: "geojson";
          data: GeoJSONFeature;
        };
      }
    | undefined;
  layer: MapLayer | undefined;
  ids: typeof searchByZoneIds;
};

function bboxToGeoJSON(searchBbox: BoundingBox): GeoJSONFeature {
  const { minLon, minLat, maxLon, maxLat } = searchBbox;

  return {
    type: "Feature",
    properties: {},
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [minLon, minLat],
          [maxLon, minLat],
          [maxLon, maxLat],
          [minLon, maxLat],
          [minLon, minLat],
        ],
      ],
    },
  };
}

function insetBoundingBox(searchBbox: BoundingBox): BoundingBox {
  const lonInset =
    (searchBbox.maxLon - searchBbox.minLon) * SEARCH_ZONE_INSET_RATIO;
  const latInset =
    (searchBbox.maxLat - searchBbox.minLat) * SEARCH_ZONE_INSET_RATIO;

  return {
    minLon: searchBbox.minLon + lonInset,
    minLat: searchBbox.minLat + latInset,
    maxLon: searchBbox.maxLon - lonInset,
    maxLat: searchBbox.maxLat - latInset,
  };
}

function createSearchByZoneLayer(sourceId: string, color: string): MapLayer {
  return {
    id: searchByZoneIds.outlineLayer,
    type: "line",
    source: sourceId,
    paint: {
      "line-color": color,
      "line-width": 2,
      "line-dasharray": [2, 2],
    },
  };
}

export function useSearchByZoneLayer(): SearchByZoneLayerProps {
  const { searchBbox, committedSearchBbox, hasSearchZoneChanged } =
    useRegulatoryAreasContext();
  const theme = useTheme();

  const displayedBbox = hasSearchZoneChanged ? committedSearchBbox : searchBbox;

  const geoJSON = useMemo(
    () =>
      displayedBbox
        ? bboxToGeoJSON(insetBoundingBox(displayedBbox))
        : undefined,
    [displayedBbox],
  );

  if (!geoJSON) {
    return {
      source: undefined,
      layer: undefined,
      ids: searchByZoneIds,
    };
  }

  return {
    source: {
      id: searchByZoneIds.source,
      definition: {
        type: "geojson",
        data: geoJSON,
      },
    },
    layer: createSearchByZoneLayer(searchByZoneIds.source, theme.charcoal),
    ids: searchByZoneIds,
  };
}
