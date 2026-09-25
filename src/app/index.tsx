import { Pressable, StyleSheet, View, type NativeSyntheticEvent } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { MaxContentWidth, Spacing } from '@constants/theme'
import { useAppContext, type ModalType } from '@contexts/AppContext'
import { useCameraContext } from '@contexts/CameraContext'

import { BottomBar } from '@components/BottomBar'
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
  VectorSource,
  type LngLat,
  type MapRef,
  type PixelPoint,
  type PressEvent,
  type PressEventWithFeatures,
  type StyleSpecification
} from '@maplibre/maplibre-react-native'
import { useCallback, useRef, useState } from 'react'
import { FilteredRegulatoryAreas } from '@features/RegulatoryAreas/FilteredRegulatoryAreas'
import { RegulatoryAreaDetails } from '@features/RegulatoryAreas/RegulatoryAreaDetails'
import {
  OUTLINE_COLOR,
  fillColorExpression,
  useRegulatoryAreasLayer
} from '@features/RegulatoryAreas/hooks/useRegulatoryAreasLayer'
import * as Sentry from '@sentry/react-native'
import { Image } from 'expo-image'
import { LoaderIcon } from '@components/LoaderIcon'
import { useGlobalStyle } from '@globalStyle'
import {
  MAX_REGULATORY_TILE_ZOOM,
  MIN_REGULATORY_TILE_ZOOM,
  REGULATORY_AREAS_TILE_LAYER
} from '@constants/regulatoryAreaTiles'
import { Link, useRouter } from 'expo-router'
import { UserFeedback } from '@features/UserFeedback'
import { getRegulatoryAreasByIds } from '@features/RegulatoryAreas/useCases/getRegulatoryAreasByIds'
import { useLocationStatus } from '@hooks/useLocationStatus'
import { useRegulatoryAreaByIdLayer } from '@features/RegulatoryAreas/hooks/useRegulatoryAreaByIdLayer'

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

function App() {
  const mapRef = useRef<MapRef>(null)
  const router = useRouter()
  const { cameraRef, clickedCoordinate, setClickedCoordinate, zoomOnRegulatoryArea } = useCameraContext()
  const globalStyle = useGlobalStyle()

  const { config, isLocationButtonEnabled, setActiveModal, isRefreshingSettingsData } = useAppContext()
  const { isLocationEnabled } = useLocationStatus()
  const {
    areRegulatoryAreasLayerVisible,
    selectedRegulatoryArea,
    isolatedRegulatoryAreaId,
    setSelectedRegulatoryArea,
    setClickedFeaturesList,
    setAreRegulatoryAreasLayerVisible,
    setSearchBbox
  } = useRegulatoryAreasContext()

  const [regulatoryAreaDetailsOrigin, setRegulatoryAreaDetailsOrigin] = useState<ModalType>(undefined)

  const regulatoryAreaLayer = useRegulatoryAreasLayer()
  const regulatoryAreaByIdLayer = useRegulatoryAreaByIdLayer()

  const onRegionDidChange = async () => {
    const bounds = await mapRef.current?.getBounds()
    if (!bounds) return undefined
    const [lonA, latA, lonB, latB] = bounds
    setSearchBbox({
      maxLat: Math.max(latA, latB),
      maxLon: Math.max(lonA, lonB),
      minLat: Math.min(latA, latB),
      minLon: Math.min(lonA, lonB)
    })

    if (!areRegulatoryAreasLayerVisible && !selectedRegulatoryArea) {
      setAreRegulatoryAreasLayerVisible(true)
    }
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
    async (point: PixelPoint) => {
      const features = await mapRef.current?.queryRenderedFeatures(point, {
        layers: [regulatoryAreaLayer.ids.fillLayer, regulatoryAreaLayer.ids.outlineLayer]
      })

      if (!features || features.length === 0) {
        setClickedCoordinate(undefined)
        return
      }

      // The area id is promoted to the MVT feature id, so it comes back directly here.
      const ids = features
        .map(feature => feature.id)
        .filter((id): id is number | string => typeof id === 'number' || typeof id === 'string')
        .map(Number)
        .filter(id => Number.isFinite(id))

      const clickedRegulatoryAreas = await getRegulatoryAreasByIds(config.mode, ids)

      if (clickedRegulatoryAreas.length === 0) {
        setClickedCoordinate(undefined)
        return
      }

      if (clickedRegulatoryAreas.length === 1) {
        // Tapping the map directly has no list to return to: clear any stale origin so closing
        // the details modal doesn't reopen a previous list/search sheet.
        setRegulatoryAreaDetailsOrigin(undefined)
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
      config,
      mapRef,
      regulatoryAreaLayer.ids,
      setRegulatoryAreaDetailsOrigin,
      setSelectedRegulatoryArea,
      setActiveModal,
      setClickedCoordinate,
      zoomOnRegulatoryArea,
      setClickedFeaturesList
    ]
  )

  const onMapPress = (event: NativeSyntheticEvent<PressEvent | PressEventWithFeatures>) => {
    const coordinate = event.nativeEvent.lngLat
    const point = event.nativeEvent.point
    if (!coordinate || !point) {
      return
    }

    setClickedCoordinate(coordinate)

    // The first frame runs before this commit paints, the second after it: the cursor is on
    // screen before the feature query takes the thread.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolveClickedAreas(point))
    })
  }

  const searchByQuery = () => {
    setActiveModal(undefined)
    router.navigate('/search')
  }

  const onSwitchContext = () => {
    setRegulatoryAreaDetailsOrigin(undefined)
  }

  return (
    <MapLibreMap
      ref={mapRef}
      mapStyle={baseMapStyle}
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

      {(!!selectedRegulatoryArea || isolatedRegulatoryAreaId) && (
        <VectorSource
          key={regulatoryAreaByIdLayer.ids.source}
          id={regulatoryAreaByIdLayer.ids.source}
          tiles={[regulatoryAreaByIdLayer.tilesUrlTemplate]}
          minzoom={MIN_REGULATORY_TILE_ZOOM}
          maxzoom={MAX_REGULATORY_TILE_ZOOM}
        >
          <Layer
            type="fill"
            id={regulatoryAreaByIdLayer.ids.fillLayer}
            source-layer={REGULATORY_AREAS_TILE_LAYER}
            filter={regulatoryAreaByIdLayer.filter}
            paint={{
              'fill-color': fillColorExpression,
              'fill-opacity': 0.3
            }}
          />
          <Layer
            type="line"
            id={regulatoryAreaByIdLayer.ids.outlineLayer}
            source-layer={REGULATORY_AREAS_TILE_LAYER}
            filter={regulatoryAreaByIdLayer.filter}
            paint={{
              'line-color': OUTLINE_COLOR,
              'line-width': 3
            }}
          />
        </VectorSource>
      )}

      {areRegulatoryAreasLayerVisible && (
        <VectorSource
          key={regulatoryAreaLayer.ids.source}
          id={regulatoryAreaLayer.ids.source}
          tiles={[regulatoryAreaLayer.tilesUrlTemplate]}
          minzoom={MIN_REGULATORY_TILE_ZOOM}
          maxzoom={MAX_REGULATORY_TILE_ZOOM}
        >
          <Layer
            type="fill"
            id={regulatoryAreaLayer.ids.fillLayer}
            source-layer={REGULATORY_AREAS_TILE_LAYER}
            filter={regulatoryAreaLayer.filter}
            paint={{
              'fill-color': fillColorExpression,
              'fill-opacity': !!selectedRegulatoryArea || isolatedRegulatoryAreaId ? 0 : 0.3
            }}
          />
          <Layer
            type="line"
            id={regulatoryAreaLayer.ids.outlineLayer}
            source-layer={REGULATORY_AREAS_TILE_LAYER}
            filter={regulatoryAreaLayer.filter}
            paint={{ 'line-color': OUTLINE_COLOR, 'line-width': 1 }}
          />
        </VectorSource>
      )}
      {clickedCoordinate && (
        // Keyed on the regulatory source: remounted after it, so drawn above its fills.
        <LayerAnnotation
          key={`clickedPoint-${regulatoryAreaLayer.ids.source}-${areRegulatoryAreasLayerVisible}`}
          id="clickedPoint"
          lngLat={clickedCoordinate}
        >
          <Layer
            id="clickedPointLayer"
            type="symbol"
            layout={{ 'icon-allow-overlap': true, 'icon-image': 'cursorIcon', 'icon-size': 0.5 }}
          />
        </LayerAnnotation>
      )}

      {isLocationButtonEnabled && isLocationEnabled && <UserLocation accuracy />}
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
          <SwitchContextButton onSwitch={onSwitchContext} />
          <View>
            <Link href="/settings" asChild onPress={() => setActiveModal(undefined)}>
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
          <BottomBar searchByQuery={searchByQuery} />
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
