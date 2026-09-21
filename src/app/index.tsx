import { Pressable, StyleSheet, View, type NativeSyntheticEvent } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { MaxContentWidth, Spacing } from '@constants/theme'
import { useAppContext, type ModalType } from '@contexts/AppContext'
import { useCameraContext } from '@contexts/CameraContext'

import { BottomBar } from '@components/BottomBar'
import { useSearchByZoneLayer } from '@components/Layers/useSearchByZoneLayer'
import { LocationButton } from '@components/Buttons/LocationButton'
import { SwitchContextButton } from '@components/Buttons/SwitchContextButton'
import { useRegulatoryAreasContext } from '@contexts/RegulatoryAreasContext'
import { SelectedRegulatoryAreas } from '@features/RegulatoryAreas/SelectedRegulatoryAreas'
import {
  Camera,
  Images,
  Layer,
  LayerAnnotation,
  Map as MapLibreMap,
  UserLocation,
  type LngLat,
  type MapRef,
  type PressEvent,
  type PressEventWithFeatures,
  type StyleSpecification,
  type ViewStateChangeEvent
} from '@maplibre/maplibre-react-native'
import { useCallback, useMemo, useRef, useState } from 'react'
import { FilteredRegulatoryAreas } from '@features/RegulatoryAreas/FilteredRegulatoryAreas'
import { RegulatoryAreaDetails } from '@features/RegulatoryAreas/RegulatoryAreaDetails'
import { useRegulatoryAreasLayer } from '@features/RegulatoryAreas/Layers/RegulatoryAreasLayers'
import * as Sentry from '@sentry/react-native'
import { Image } from 'expo-image'
import { LoaderIcon } from '@components/LoaderIcon'
import { useGlobalStyle } from '@globalStyle'
import { Link, useRouter } from 'expo-router'
import { UserFeedback } from '@features/UserFeedback'
import { isPointInGeometry } from '@utils/isPointInGeometry'
import type { BoundingBox } from '@/types/mapTypes'

const ENV = process.env.EXPO_PUBLIC_SENTRY_ENV
const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN
const MAPBOX_KEY = process.env.EXPO_PUBLIC_MAPBOX_KEY

if (ENV !== 'dev' && SENTRY_DSN) {
  Sentry.init({
    attachStacktrace: false,
    dsn: SENTRY_DSN,
    enableAutoSessionTracking: false,
    enableLogs: true,
    environment: ENV,
    integrations: [Sentry.mobileReplayIntegration()],
    sendDefaultPii: false
  })
}

export const CENTERED_ON_FRANCE: LngLat = [2.99049, 46.82801]

const baseMapStyle: StyleSpecification = {
  layers: [
    {
      id: 'cartoLight',
      source: 'cartoLight',
      type: 'raster'
    }
  ],
  sources: {
    cartoLight: {
      attribution: '&copy OpenStreetMap contributors &copy CARTO',
      tileSize: 256,
      tiles: [`https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png?key=${MAPBOX_KEY}`],
      type: 'raster'
    }
  },
  version: 8
}

const LOCATION_FOCUS_ZOOM = 12

/** Cheap rejection before the ray-cast: list items already carry a precomputed bbox. */
function isPointInBoundingBox([lon, lat]: LngLat, bbox: BoundingBox): boolean {
  return lon >= bbox.minLon && lon <= bbox.maxLon && lat >= bbox.minLat && lat <= bbox.maxLat
}

function App() {
  const mapRef = useRef<MapRef>(null)
  const router = useRouter()
  const {
    cameraRef,
    clickedCoordinate,
    setClickedCoordinate,
    zoomOnRegulatoryArea,
    setIsFromFlyToBbox,
    isFromFlyToBbox
  } = useCameraContext()
  const globalStyle = useGlobalStyle()

  const { isLocationButtonEnabled, setActiveModal, isRefreshingSettingsData } = useAppContext()
  const {
    areRegulatoryAreasLayerVisible,
    isSearchZoneActive,
    setSearchBbox,
    setCommittedSearchBbox,
    setCurrentZoom,
    regulatoryAreas,
    setSelectedRegulatoryArea,
    setClickedFeaturesList
  } = useRegulatoryAreasContext()

  const [regulatoryAreaDetailsOrigin, setRegulatoryAreaDetailsOrigin] = useState<ModalType>(undefined)

  const regulatoryAreaLayer = useRegulatoryAreasLayer()
  const searchByZone = useSearchByZoneLayer()

  const mapStyle: StyleSpecification = useMemo(
    () => ({
      ...baseMapStyle,
      layers: [
        ...baseMapStyle.layers,
        ...(isSearchZoneActive && areRegulatoryAreasLayerVisible ? regulatoryAreaLayer.layers : []),
        ...(searchByZone.layer ? [searchByZone.layer] : [])
      ],
      sources: {
        ...baseMapStyle.sources,
        ...(searchByZone.source && {
          [searchByZone.source.id]: searchByZone.source.definition
        }),
        ...(regulatoryAreaLayer.source && {
          [regulatoryAreaLayer.source.id]: regulatoryAreaLayer.source.definition
        })
      }
    }),
    [
      isSearchZoneActive,
      areRegulatoryAreasLayerVisible,
      regulatoryAreaLayer.layers,
      regulatoryAreaLayer.source,
      searchByZone.layer,
      searchByZone.source
    ]
  )

  /** Rebuilt only when the layer reloads, not on every tap. */
  const geometriesById = useMemo(
    () =>
      new Map(
        (regulatoryAreaLayer.source?.definition.data.features ?? []).map(feature => [
          feature.properties?.id,
          feature.geometry
        ])
      ),
    [regulatoryAreaLayer.source]
  )

  const onRegionDidChange = async (event: NativeSyntheticEvent<ViewStateChangeEvent>) => {
    setCurrentZoom(event.nativeEvent.zoom)

    if (isFromFlyToBbox) {
      setIsFromFlyToBbox(false)
      return
    }

    const bounds = await mapRef.current?.getBounds()
    if (!bounds) return undefined
    const [lonA, latA, lonB, latB] = bounds
    setSearchBbox({
      maxLat: Math.max(latA, latB),
      maxLon: Math.max(lonA, lonB),
      minLat: Math.min(latA, latB),
      minLon: Math.min(lonA, lonB)
    })
  }

  const handleLocate = useCallback((coordinates: { longitude: number; latitude: number }) => {
    cameraRef.current?.flyTo({
      center: [coordinates.longitude, coordinates.latitude],
      duration: 900,
      easing: 'ease',
      zoom: LOCATION_FOCUS_ZOOM
    })
    // not including cameraRef in the dependency array to avoid unnecessary re-renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const resolveClickedAreas = useCallback(
    (coordinate: LngLat) => {
      const clickedRegulatoryAreas = regulatoryAreas.filter(area => {
        if (!isPointInBoundingBox(coordinate, area.bbox)) {
          return false
        }

        const geometry = geometriesById.get(area.id)

        return !!geometry && isPointInGeometry(coordinate, geometry)
      })

      if (clickedRegulatoryAreas.length === 0) {
        setClickedCoordinate(undefined)
        return
      }

      if (clickedRegulatoryAreas.length === 1) {
        setSelectedRegulatoryArea(clickedRegulatoryAreas[0])
        setActiveModal('REGULATORY_AREA_DETAILS_MODAL')
        setClickedCoordinate(undefined)
        zoomOnRegulatoryArea(clickedRegulatoryAreas[0])
        return
      }

      setClickedFeaturesList(clickedRegulatoryAreas)
      setActiveModal('CLICKED_FEATURES_LIST_MODAL')
    },
    [
      regulatoryAreas,
      geometriesById,
      setSelectedRegulatoryArea,
      setActiveModal,
      setClickedCoordinate,
      zoomOnRegulatoryArea,
      setClickedFeaturesList
    ]
  )

  const onMapPress = (event: NativeSyntheticEvent<PressEvent | PressEventWithFeatures>) => {
    if (!isSearchZoneActive) {
      return
    }

    const coordinate = event.nativeEvent.lngLat
    if (!coordinate) {
      return
    }

    setClickedCoordinate(coordinate)

    // The first frame runs before this commit paints, the second after it: the cursor is on
    // screen before the ray-cast takes the thread.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolveClickedAreas(coordinate))
    })
  }

  const searchByQuery = async () => {
    const bounds = await mapRef.current?.getBounds()

    if (!bounds) return undefined
    const [lonA, latA, lonB, latB] = bounds

    if (!isSearchZoneActive) {
      setCommittedSearchBbox({
        maxLat: Math.max(latA, latB),
        maxLon: Math.max(lonA, lonB),
        minLat: Math.min(latA, latB),
        minLon: Math.min(lonA, lonB)
      })
    }

    setActiveModal(undefined)
    setTimeout(() => {
      router.navigate('/search')
    }, 1000)
  }

  return (
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
      <Images images={{ cursorIcon: require('@assets/images/cursor.png') }} />

      {clickedCoordinate && (
        <LayerAnnotation id="clickedPoint" lngLat={clickedCoordinate}>
          <Layer
            id="clickedPointLayer"
            type="symbol"
            layout={{ 'icon-allow-overlap': true, 'icon-image': 'cursorIcon', 'icon-size': 0.5 }}
          />
        </LayerAnnotation>
      )}

      {isLocationButtonEnabled && <UserLocation accuracy />}
      <Camera
        ref={cameraRef}
        initialViewState={{
          center: CENTERED_ON_FRANCE,
          zoom: 4
        }}
        maxBounds={[-180, -90, 180, 90]}
      />
      <SafeAreaView style={styles.safeArea} pointerEvents="box-none">
        <View style={styles.boutonsWrapper}>
          <SwitchContextButton />
          <View>
            <Link href="/settings" asChild>
              <Pressable
                accessibilityRole="link"
                accessibilityState={{ disabled: false }}
                style={StyleSheet.flatten([globalStyle.squareButton, { backgroundColor: 'white' }])}
              >
                {isRefreshingSettingsData && (
                  <View style={globalStyle.dot}>
                    <LoaderIcon tintColor="white" size="SMALL" />
                  </View>
                )}
                <Image source={require('@assets/icons/settings.svg')} style={globalStyle.iconNormal} />
              </Pressable>
            </Link>
            <UserFeedback />
          </View>
        </View>
        <SelectedRegulatoryAreas setRegulatoryAreaDetailsOrigin={setRegulatoryAreaDetailsOrigin} />
        <FilteredRegulatoryAreas setRegulatoryAreaDetailsOrigin={setRegulatoryAreaDetailsOrigin} />
        <RegulatoryAreaDetails origin={regulatoryAreaDetailsOrigin} />

        <View style={styles.bottomWrapper}>
          <LocationButton onLocate={handleLocate} />
          <BottomBar isLoading={regulatoryAreaLayer.isLoading} searchByQuery={searchByQuery} />
        </View>
      </SafeAreaView>
    </MapLibreMap>
  )
}

export default ENV === 'dev' ? App : Sentry.wrap(App)

const styles = StyleSheet.create({
  bottomWrapper: {
    gap: Spacing.five
  },
  boutonsWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  safeArea: {
    flex: 1,
    gap: Spacing.three,
    justifyContent: 'space-between',
    maxWidth: MaxContentWidth,
    paddingBottom: Spacing.three,
    paddingHorizontal: Spacing.three
  }
})
