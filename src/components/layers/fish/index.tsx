import { useMemo } from "react";

import { useTheme } from "@/hooks/use-theme";
import type { StyleSpecification } from "@maplibre/maplibre-react-native";

import { useAppMode } from "@/contexts/AppModeContext";
import type { BoundingBox } from "@/lib/fish/fishRegulatoryAreasQueries";
import {
  normalizeFeatureProperty,
  resolveThemeColors,
  stringToArrayItem,
} from "@/utils/layersStyle";
import {
  type GeoJSONCollection,
  useFishRegulatoryAreasGeoJSON,
} from "./useFishRegulatoryAreasGeoJSON";

type MapLayer = NonNullable<StyleSpecification["layers"]>[number];

export const fishRegulatoryAreasIds = {
  source: "fish-regulatory-areas-source",
  fillLayer: "fish-regulatory-areas-fill",
  outlineLayer: "fish-regulatory-areas-outline",
};

const FEATURE_FILL_COLOR_PROPERTY = "__fishFillColor";
const DEFAULT_FISH_AREA_COLOR = "#67A9CF";

export type FishRegulatoryAreasStyleChunk = {
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
};

function buildFeatureColorKey(properties: Record<string, unknown>): string {
  const id = normalizeFeatureProperty(properties.id);
  const zone = normalizeFeatureProperty(properties.zone);
  const regulatoryAreaTheme = normalizeFeatureProperty(properties.thematique);

  return `${id}-${zone}-${regulatoryAreaTheme}`;
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

export function useFishRegulatoryAreasLayer(
  bbox: BoundingBox | undefined,
): FishRegulatoryAreasStyleChunk {
  const { geoJSON, isLoading } = useFishRegulatoryAreasGeoJSON(bbox);

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
    };
  }

  const layerChunk: FishRegulatoryAreasStyleChunk = {
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
  };

  return layerChunk;
}
