import { useCallback, useMemo, useState } from "react";

import { useRegulatoryAreas } from "@/contexts/RegulatoryAreasContext";
import { useTheme } from "@/hooks/use-theme";
import { GeoJSONCollection, MapLayer } from "@/types/MapTypes";
import { fetchFishRegulatoryAreasGeoJSON } from "./fetchFishRegulatoryAreasGeoJSON";

export const fishRegulatoryAreasIds = {
  source: "fish-regulatory-areas-source",
  fillLayer: "fish-regulatory-areas-fill",
  outlineLayer: "fish-regulatory-areas-outline",
};

const DEFAULT_FISH_AREA_COLOR = "#67A9CF";

export type FishRegulatoryAreasLayerProps = {
  isLoading: boolean;
  source:
    | {
        id: string;
        definition: {
          type: "geojson";
          data: GeoJSONCollection;
        };
      }
    | undefined;
  layers: MapLayer[];
  ids: typeof fishRegulatoryAreasIds;
  fetch: () => Promise<void>;
};

function createFishRegulatoryAreasLayers(sourceId: string): MapLayer[] {
  const metadataIsShownExpression = [
    "to-boolean",
    ["coalesce", ["get", "metadataIsShowed"], false],
  ];

  return [
    {
      id: fishRegulatoryAreasIds.fillLayer,
      type: "fill",
      source: sourceId,
      paint: {
        "fill-color": [
          "coalesce",
          ["get", "fillColor"],
          DEFAULT_FISH_AREA_COLOR,
        ],
        "fill-opacity": 0.4,
      },
    },
    {
      id: fishRegulatoryAreasIds.outlineLayer,
      type: "line",
      source: sourceId,
      paint: {
        "line-color": "#05055eb3",
        "line-width": ["case", metadataIsShownExpression, 3, 1] as any,
      },
    },
  ];
}

export function useFishRegulatoryAreasLayer(): FishRegulatoryAreasLayerProps {
  const [geoJSON, setGeoJSON] = useState<GeoJSONCollection | undefined>(
    undefined,
  );
  const [isLoading, setIsLoading] = useState(false);

  const { searchBbox, zoom, setTotalCount } = useRegulatoryAreas();
  const theme = useTheme();

  const geoJSONWithResolvedFillColor = useMemo(() => {
    if (!geoJSON) {
      return undefined;
    }

    return {
      ...geoJSON,
      features: geoJSON.features.map((feature) => {
        const resolvedFillColor =
          theme[feature.properties?.fillColor as keyof typeof theme] ??
          feature.properties?.fillColor ??
          DEFAULT_FISH_AREA_COLOR;

        return {
          ...feature,
          properties: {
            ...feature.properties,
            fillColor: resolvedFillColor,
          },
        };
      }),
    };
  }, [geoJSON, theme]);

  const fetch = useCallback(async () => {
    if (!searchBbox || !zoom) {
      setGeoJSON(undefined);
      return;
    }
    if (isLoading) {
      return;
    }
    setIsLoading(true);
    try {
      const result = await fetchFishRegulatoryAreasGeoJSON(
        searchBbox,
        zoom,
        setTotalCount,
      );
      setGeoJSON(result);
    } catch (error) {
      console.warn("Failed to load regulatory areas", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchBbox, zoom, isLoading, setTotalCount]);

  if (!geoJSONWithResolvedFillColor) {
    return {
      isLoading,
      source: undefined,
      layers: [],
      ids: fishRegulatoryAreasIds,
      fetch,
    };
  }

  return {
    isLoading,
    source: {
      id: fishRegulatoryAreasIds.source,
      definition: {
        type: "geojson",
        data: geoJSONWithResolvedFillColor,
      },
    },
    layers: createFishRegulatoryAreasLayers(fishRegulatoryAreasIds.source),
    ids: fishRegulatoryAreasIds,
    fetch,
  };
}
