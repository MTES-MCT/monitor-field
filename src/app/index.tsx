import { StyleSheet, View, type NativeSyntheticEvent } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MaxContentWidth, Spacing } from "@constants/theme";
import { useAppContext } from "@contexts/AppContext";

import { type BoundingBox } from "@/types/mapTypes";
import { BottomBar } from "@components/BottomBar";
import { useSearchByZoneLayer } from "@components/Layers/useSearchByZoneLayer";
import { LocationButton } from "@components/LocationButton";
import { SwitchContextButton } from "@components/SwitchContextButton";
import { useRegulatoryAreasContext } from "@contexts/RegulatoryAreasContext";
import { useFishRegulatoryAreasLayer } from "@features/RegulatoryAreas/Layers/FishLayers";
import { SelectedRegulatoryAreas } from "@features/RegulatoryAreas/SelectedRegulatoryAreas";
import {
  Camera,
  Map as MapLibreMap,
  UserLocation,
  type CameraRef,
  type MapRef,
  type PressEvent,
  type PressEventWithFeatures,
  type StyleSpecification,
} from "@maplibre/maplibre-react-native";
import { useEffect, useRef } from "react";
import { FilteredRegulatoryAreas } from "@features/RegulatoryAreas/FilteredRegulatoryAreas";
import { RegulatoryAreaDetails } from "@features/RegulatoryAreas/RegulatoryAreaDetails";

export const CENTERED_ON_FRANCE = [2.99049, 46.82801];

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
  const { config, setIsLocationEnabled, isLocationEnabled } = useAppContext();
  const mapRef = useRef<MapRef>(null);
  const cameraRef = useRef<CameraRef>(null);

  const {
    isSearchZoneActive,
    setHasSearchZoneChanged,
    setSearchBbox,
    regulatoryAreas,
    setSelectedRegulatoryArea,
    setIsSearchByQueryActive,
    setClickedFeaturesList,
    setIsListVisible,
  } = useRegulatoryAreasContext();

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
    const bounds = await mapRef.current?.getBounds();
    if (!bounds) return undefined;
    const [lonA, latA, lonB, latB] = bounds;
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

  const onFocusGroupOrRegulatoryArea = (bbox: BoundingBox) => {
    cameraRef.current?.fitBounds(
      [bbox.minLon, bbox.minLat, bbox.maxLon, bbox.maxLat],
      {
        padding: {
          top: 40,
          right: 40,
          bottom: 540,
          left: 40,
        },
        duration: 700,
        easing: "ease",
      },
    );
  };

  const onMapPress = async (
    event: NativeSyntheticEvent<PressEvent | PressEventWithFeatures>,
  ) => {
    if (!isMonitorFish || !isSearchZoneActive) {
      return;
    }

    const position = event.nativeEvent.point;
    const features = await mapRef.current?.queryRenderedFeatures(position, {
      layers: [fish.ids.fillLayer],
    });
    const clickedFeaturesIds =
      features?.map((feature) => feature.properties?.id) ?? [];
    const clickedRegulatoryAreas = regulatoryAreas.filter((area) =>
      clickedFeaturesIds.includes(area.id),
    );

    const featuresToDisplay =
      clickedRegulatoryAreas && clickedRegulatoryAreas.length > 1
        ? clickedRegulatoryAreas
        : undefined;
    setClickedFeaturesList(featuresToDisplay);

    const selectedFeature =
      !clickedRegulatoryAreas || clickedRegulatoryAreas.length > 1
        ? undefined
        : clickedRegulatoryAreas[0];
    setSelectedRegulatoryArea(selectedFeature);

    if (clickedRegulatoryAreas.length === 1) {
      onFocusGroupOrRegulatoryArea(clickedRegulatoryAreas[0].bbox);
    }
  };

  const consultRegulatoryAreas = () => {
    setClickedFeaturesList(undefined);
    setSelectedRegulatoryArea(undefined);
    setIsListVisible(true);
    setIsSearchByQueryActive(false);
  };

  return (
    <>
      <MapLibreMap
        ref={mapRef}
        mapStyle={mapStyle}
        touchZoom
        doubleTapZoom
        doubleTapHoldZoom
        dragPan
        touchPitch
        touchRotate={false}
        onRegionDidChange={onRegionDidChange}
        onPress={onMapPress}
      >
        {isLocationEnabled && <UserLocation accuracy />}
        <Camera
          ref={cameraRef}
          initialViewState={
            isLocationEnabled
              ? undefined
              : {
                  zoom: 4,
                  center: [2.99049, 46.82801],
                }
          }
          maxBounds={[-180, -90, 180, 90]}
          trackUserLocation={isLocationEnabled ? "default" : undefined}
        />
        <SafeAreaView style={styles.safeArea} pointerEvents="box-none">
          <SwitchContextButton />

          <SelectedRegulatoryAreas
            onFocusGroupOrRegulatoryArea={onFocusGroupOrRegulatoryArea}
          />

          <FilteredRegulatoryAreas
            onFocusGroupOrRegulatoryArea={onFocusGroupOrRegulatoryArea}
          />

          <RegulatoryAreaDetails />

          <View style={styles.bottomWrapper}>
            <LocationButton onLocate={handleLocate} />
            <BottomBar consultRegulatoryAreas={consultRegulatoryAreas} />
          </View>
        </SafeAreaView>
      </MapLibreMap>
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
