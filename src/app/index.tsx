import { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MaxContentWidth, Spacing } from "@/constants/theme";
import { useAppMode } from "@/contexts/AppModeContext";

import { BottomBar } from "@/components/BottomBar";
import { useFishRegulatoryAreasLayer } from "@/components/Layers/Fish";
import { useSearchByZoneLayer } from "@/components/Layers/useSearchByZoneLayer";
import { LocationButton } from "@/components/LocationButton";
import { SwitchContextButton } from "@/components/SwitchContextButton";
import { useRegulatoryAreas } from "@/contexts/RegulatoryAreasContext";
import {
  Camera,
  Map,
  UserLocation,
  type CameraRef,
  type MapRef,
  type StyleSpecification,
} from "@maplibre/maplibre-react-native";

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

const LOCATION_FOCUS_ZOOM = 14;

export default function App({
  isFirstLocationEnabled,
}: {
  isFirstLocationEnabled: boolean;
}) {
  const { config, setIsLocationEnabled, isLocationEnabled } = useAppMode();
  const mapRef = useRef<MapRef>(null);
  const cameraRef = useRef<CameraRef>(null);

  const {
    isSearchZoneActive,
    setHasSearchZoneChanged,
    setZoom,
    setSearchBbox,
  } = useRegulatoryAreas();

  const isMonitorFish = config.mode === "MONITORFISH";
  const fish = useFishRegulatoryAreasLayer();
  const searchByZone = useSearchByZoneLayer();

  const mapStyle: StyleSpecification = {
    ...baseMapStyle,
    sources: {
      ...baseMapStyle.sources,
      ...(isSearchZoneActive &&
        searchByZone.source && {
          [searchByZone.source.id]: searchByZone.source.definition,
        }),
      ...(isMonitorFish &&
        fish.source && {
          [fish.source.id]: fish.source.definition,
        }),
    },
    layers: [
      ...baseMapStyle.layers,
      ...(isMonitorFish && isSearchZoneActive ? fish.layers : []),
      ...(isSearchZoneActive && searchByZone.layer ? [searchByZone.layer] : []),
    ],
  };

  useEffect(() => {
    setIsLocationEnabled(isFirstLocationEnabled);
  }, [isFirstLocationEnabled, setIsLocationEnabled]);

  const onRegionDidChange = async () => {
    if (isSearchZoneActive) {
      setHasSearchZoneChanged(true);
    }
    const zoom = await mapRef.current?.getZoom();
    const bounds = await mapRef.current?.getBounds();
    if (!bounds) return null;
    const [lonA, latA, lonB, latB] = bounds;
    setZoom(Math.round(zoom ?? 3));
    setSearchBbox({
      minLon: Math.min(lonA, lonB),
      minLat: Math.min(latA, latB),
      maxLon: Math.max(lonA, lonB),
      maxLat: Math.max(latA, latB),
    });
  };

  const handleLocate = (coordinates: {
    longitude: number;
    latitude: number;
  }) => {
    cameraRef.current?.flyTo({
      center: [coordinates.longitude, coordinates.latitude],
      zoom: LOCATION_FOCUS_ZOOM,
      duration: 900,
      easing: "ease",
    });
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
        onRegionDidChange={onRegionDidChange}
      >
        {isLocationEnabled && <UserLocation accuracy />}
        <Camera
          ref={cameraRef}
          zoom={6}
          trackUserLocation={isLocationEnabled ? "default" : undefined}
        />
        <SafeAreaView style={styles.safeArea} pointerEvents="box-none">
          <SwitchContextButton />
          <View style={styles.bottomWrapper}>
            <LocationButton onLocate={handleLocate} />
            <BottomBar
              onSearch={isMonitorFish ? fish.fetch : () => Promise.resolve()}
            />
          </View>
        </SafeAreaView>
      </Map>
    </>
  );
}

const styles = StyleSheet.create({
  bottomWrapper: {
    gap: Spacing.five,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.three,
    gap: Spacing.three,
    paddingBottom: Spacing.three,
    maxWidth: MaxContentWidth,
    justifyContent: "space-between",
  },
});
