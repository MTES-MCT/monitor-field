import { useCallback, useMemo, useRef, useState } from "react";

import { GeoJSONCollection, MapLayer } from "@/types/MapTypes";
import { useRegulatoryAreasContext } from "@contexts/RegulatoryAreasContext";
import { useTheme } from "@hooks/use-theme";
import { getFishRegulatoryAreas } from "../../useCases/getFishRegulatoryAreas";

export const fishRegulatoryAreasIds = {
  source: "fish-regulatory-areas-source",
  fillLayer: "fish-regulatory-areas-fill",
  outlineLayer: "fish-regulatory-areas-outline",
};

const DEFAULT_FISH_AREA_COLOR = "#67A9CF";
const OUTLINE_COLOR = "#05055eb3";
const isSelectedExpression: any = [
  "to-boolean",
  ["coalesce", ["get", "isSelected"], false],
];
const fillColorExpression: any = [
  "coalesce",
  ["get", "fillColor"],
  DEFAULT_FISH_AREA_COLOR,
];
const outlineWidthExpression = ["case", isSelectedExpression, 3, 1] as any;

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
  return [
    {
      id: fishRegulatoryAreasIds.fillLayer,
      type: "fill",
      source: sourceId,
      paint: {
        "fill-color": fillColorExpression,
        "fill-opacity": 0.4,
      },
    },
    {
      id: fishRegulatoryAreasIds.outlineLayer,
      type: "line",
      source: sourceId,
      paint: {
        "line-color": OUTLINE_COLOR,
        "line-width": outlineWidthExpression,
      },
    },
  ];
}

export function useFishRegulatoryAreasLayer(): FishRegulatoryAreasLayerProps {
  const [geoJSON, setGeoJSON] = useState<GeoJSONCollection | undefined>(
    undefined,
  );
  const [isLoading, setIsLoading] = useState(false);

  const {
    searchBbox,
    committedSearchBbox,
    setTotalCount,
    setRegulatoryAreas,
    selectedRegulatoryArea,
  } = useRegulatoryAreasContext();
  const theme = useTheme();
  const requestIdRef = useRef(0);

  const geoJSONWithResolvedFillColor = useMemo(() => {
    if (!geoJSON) {
      return undefined;
    }

    return {
      ...geoJSON,
      features: geoJSON.features.map((feature) => {
        const resolvedFillColor =
          theme[feature.properties?.fillColor as keyof typeof theme] ??
          DEFAULT_FISH_AREA_COLOR;

        return {
          ...feature,
          properties: {
            ...feature.properties,
            fillColor: resolvedFillColor,
            isSelected: feature.properties?.id === selectedRegulatoryArea?.id,
          },
        };
      }),
    };
  }, [geoJSON, theme, selectedRegulatoryArea]);

  const fetch = useCallback(async () => {
    const bbox = committedSearchBbox ?? searchBbox;

    if (!bbox) {
      setGeoJSON(undefined);
      setRegulatoryAreas([]);
      setTotalCount(0);
      return;
    }

    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    try {
      const result = await getFishRegulatoryAreas(bbox);

      if (requestIdRef.current !== requestId) {
        return;
      }

      setTotalCount(result.totalCount);
      setRegulatoryAreas(result.listItems);
      setGeoJSON(result.geoJSON);
    } catch (error) {
      // oxlint-disable-next-line no-console
      console.warn("Failed to load regulatory areas", error);
    } finally {
      if (requestIdRef.current === requestId) {
        setIsLoading(false);
      }
    }
  }, [committedSearchBbox, searchBbox, setRegulatoryAreas, setTotalCount]);

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
