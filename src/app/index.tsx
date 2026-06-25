import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { useAppMode } from "@/contexts/AppModeContext";
import type { BoundingBox } from "@/lib/fish/fishRegulatoryAreasQueries";

import { useFishRegulatoryAreasLayer } from "@/components/layers/fish";
import { SwitchContextButton } from "@/components/SwitchContextButton";
import {
  Camera,
  Map,
  type MapRef,
  type StyleSpecification,
  type ViewStateChangeEvent,
} from "@maplibre/maplibre-react-native";
import type { NativeSyntheticEvent } from "react-native";

const baseMapStyle: StyleSpecification = {
  version: 8,
  sources: {
    cartoLight: {
      type: "raster",
      tiles: ["https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
    },
  },
  layers: [
    {
      id: "cartoLight",
      type: "raster",
      source: "cartoLight",
    },
  ],
};

export default function HomeScreen() {
  const { config } = useAppMode();
  const mapRef = useRef<MapRef>(null);
  const [visibleBbox, setVisibleBbox] = useState<BoundingBox | undefined>(
    undefined,
  );
  const isMonitorFish = config.mode === "MONITORFISH";
  const fish = useFishRegulatoryAreasLayer(
    isMonitorFish ? visibleBbox : undefined,
  );

  const setVisibleBboxFromBounds = useCallback(
    (bounds: [number, number, number, number]) => {
      const [minLon, minLat, maxLon, maxLat] = bounds;

      setVisibleBbox((current: BoundingBox | undefined) => {
        if (
          current &&
          current.minLon === minLon &&
          current.minLat === minLat &&
          current.maxLon === maxLon &&
          current.maxLat === maxLat
        ) {
          return current;
        }

        return {
          minLon,
          minLat,
          maxLon,
          maxLat,
        };
      });
    },
    [],
  );

  const handleRegionDidChange = useCallback(
    (event: NativeSyntheticEvent<ViewStateChangeEvent>) => {
      setVisibleBboxFromBounds(event.nativeEvent.bounds);
    },
    [setVisibleBboxFromBounds],
  );

  useEffect(() => {
    if (!isMonitorFish) {
      return;
    }

    void (async () => {
      const bounds = await mapRef.current?.getBounds();

      if (bounds) {
        setVisibleBboxFromBounds(bounds);
      }
    })();
  }, [isMonitorFish, setVisibleBboxFromBounds]);

  const mapStyle: StyleSpecification = {
    ...baseMapStyle,
    sources: {
      ...baseMapStyle.sources,
      ...(isMonitorFish &&
        fish.source && {
          [fish.source.id]: fish.source.definition,
        }),
    },
    layers: [...baseMapStyle.layers, ...(isMonitorFish ? fish.layers : [])],
  };

  return (
    <>
      <Map
        ref={mapRef}
        mapStyle={mapStyle}
        touchZoom
        doubleTapZoom
        doubleTapHoldZoom
        dragPan
        touchPitch
        touchRotate={false}
        onRegionDidChange={handleRegionDidChange}
      >
        <Camera zoom={3} center={[2.99049, 46.82801]} />
        <SafeAreaView style={styles.safeArea} pointerEvents="box-none">
          <SwitchContextButton />
        </SafeAreaView>
      </Map>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.three,
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
});
