import { StyleSheet, View, type NativeSyntheticEvent } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MaxContentWidth, Spacing } from "@constants/theme";
import { useAppMode } from "@contexts/AppModeContext";

import { type BoundingBox } from "@/types/MapTypes";
import { BottomBar } from "@components/BottomBar";
import { useSearchByZoneLayer } from "@components/Layers/useSearchByZoneLayer";
import { LocationButton } from "@components/LocationButton";
import { SwitchContextButton } from "@components/SwitchContextButton";
import {
  useRegulatoryAreasContext,
  type RegulatoryAreaListItem,
} from "@contexts/RegulatoryAreasContext";
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
import { useEffect, useRef, useState } from "react";
import { FilteredRegulatoryAreas } from "@features/RegulatoryAreas/FilteredRegulatoryAreas";

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
  const { config, setIsLocationEnabled, isLocationEnabled } = useAppMode();
  const mapRef = useRef<MapRef>(null);
  const cameraRef = useRef<CameraRef>(null);

  const {
    isSearchZoneActive,
    setHasSearchZoneChanged,
    setSearchBbox,
    regulatoryAreas,
    setSelectedRegulatoryArea,
    openRegulatoryList,
    openRegulatoryDetails,
    closeRegulatoryDetails,
  } = useRegulatoryAreasContext();

  const isMonitorFish = config.mode === "MONITORFISH";
  const fish = useFishRegulatoryAreasLayer();
  const searchByZone = useSearchByZoneLayer();
  const [clickedRegulatoryAreas, setClickedRegulatoryAreas] = useState<
    RegulatoryAreaListItem[]
  >([]);

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

  const handleFocusGroup = (bbox: BoundingBox) => {
    cameraRef.current?.fitBounds(
      [bbox.minLon, bbox.minLat, bbox.maxLon, bbox.maxLat],
      {
        padding: {
          top: 40,
          right: 40,
          bottom: 40,
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

    const presentOnNextFrame = (callback: () => void) => {
      requestAnimationFrame(() => {
        callback();
      });
    };

    const mapPoint = event.nativeEvent.point;
    const features = await mapRef.current?.queryRenderedFeatures(mapPoint, {
      layers: [fish.ids.fillLayer],
    });
    const clickedFeaturesIds =
      features?.map((feature) => feature.properties?.id) ?? [];
    const clickedRegulatoryAreas = regulatoryAreas.filter((area) =>
      clickedFeaturesIds.includes(area.id),
    );

    if (!clickedRegulatoryAreas.length) {
      closeRegulatoryDetails();

      setClickedRegulatoryAreas([]);
      setSelectedRegulatoryArea(undefined);

      return;
    }

    if (clickedRegulatoryAreas.length === 1) {
      setClickedRegulatoryAreas([]);
      setSelectedRegulatoryArea(clickedRegulatoryAreas[0]);
      presentOnNextFrame(() => {
        openRegulatoryDetails();
      });

      return;
    }

    closeRegulatoryDetails();
    setSelectedRegulatoryArea(undefined);
    setClickedRegulatoryAreas(clickedRegulatoryAreas);
    presentOnNextFrame(() => {
      openRegulatoryList();
    });
  };

  const consultRegulatoryAreas = () => {
    openRegulatoryList();
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
            clickedRegulatoryAreas={clickedRegulatoryAreas}
            setClickedRegulatoryAreas={setClickedRegulatoryAreas}
          />
          <FilteredRegulatoryAreas onGroupFocus={handleFocusGroup} />

          <View style={styles.bottomWrapper}>
            <LocationButton onLocate={handleLocate} />
            <BottomBar
              consultRegulatoryAreas={consultRegulatoryAreas}
              onSearch={isMonitorFish ? fish.fetch : () => Promise.resolve()}
            />
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
