import { useCallback, useMemo, useState } from "react";

import { useTheme } from "@/hooks/use-theme";

import { useAppMode } from "@/contexts/AppModeContext";
import { useRegulatoryAreas } from "@/contexts/RegulatoryAreasContext";
import { GeoJSONCollection, MapLayer } from "@/types/MapTypes";
import {
  normalizeFeatureProperty,
  resolveThemeColors,
  stringToArrayItem,
} from "@/utils/layersStyle";
import { fetchFishRegulatoryAreasGeoJSON } from "./useFishRegulatoryAreasGeoJSON";

export const fishRegulatoryAreasIds = {
  source: "fish-regulatory-areas-source",
  fillLayer: "fish-regulatory-areas-fill",
  outlineLayer: "fish-regulatory-areas-outline",
};

const FEATURE_FILL_COLOR_PROPERTY = "__fishFillColor";
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

function buildFeatureColorKey(properties: Record<string, unknown>): string {
  const id = normalizeFeatureProperty(properties.id);
  const type = normalizeFeatureProperty(properties.type_de_reglementation);
  const regulatoryAreaTheme = normalizeFeatureProperty(properties.thematique);

  return `${id}-${type}-${regulatoryAreaTheme}`;
}

function withPerFeatureFillColor(
  geoJSON: GeoJSONCollection,
  palette: string[],
): GeoJSONCollection {
  if (palette.length === 0) {
    return geoJSON;
  }

  return {
    ...geoJSON,
    features: geoJSON.features.map((feature) => {
      const colorKey = buildFeatureColorKey(feature.properties);
      const fillColor = stringToArrayItem(colorKey, palette) ?? palette[0];

      return {
        ...feature,
        properties: {
          ...feature.properties,
          [FEATURE_FILL_COLOR_PROPERTY]: fillColor,
        },
      };
    }),
  };
}

function createFishRegulatoryAreasLayers(
  sourceId: string,
  colors: string[] = [],
): MapLayer[] {
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
          ["get", FEATURE_FILL_COLOR_PROPERTY],
          colors[0] ?? DEFAULT_FISH_AREA_COLOR,
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

  const { searchBbox, zoom } = useRegulatoryAreas();

  const fetch = useCallback(async () => {
    console.log(
      "Fetching fish regulatory areas for bbox",
      searchBbox,
      "zoom",
      zoom,
    );
    if (!searchBbox || !zoom) {
      setGeoJSON(undefined);
      return;
    }
    if (isLoading) {
      return;
    }
    setIsLoading(true);
    try {
      const result = await fetchFishRegulatoryAreasGeoJSON(searchBbox, zoom);
      setGeoJSON(result);
    } catch (error) {
      console.warn("Failed to load regulatory areas", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchBbox, zoom, isLoading]);

  const theme = useTheme();
  const { config } = useAppMode();
  const palette = useMemo(
    () => resolveThemeColors(theme, config?.colors),
    [theme, config?.colors],
  );

  const geoJSONWithPerFeatureColor = useMemo(() => {
    if (!geoJSON) {
      return undefined;
    }

    return withPerFeatureFillColor(geoJSON, palette);
  }, [geoJSON, palette]);

  if (!geoJSONWithPerFeatureColor) {
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
        data: geoJSONWithPerFeatureColor,
      },
    },
    layers: createFishRegulatoryAreasLayers(
      fishRegulatoryAreasIds.source,
      palette,
    ),
    ids: fishRegulatoryAreasIds,
    fetch,
  };
}
