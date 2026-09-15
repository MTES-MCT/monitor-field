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
  Map as MapLibreMap,
  UserLocation,
  type LayerSpecification,
  type LngLat,
  type MapRef,
  type PressEvent,
  type PressEventWithFeatures,
  type StyleSpecification,
  type ViewStateChangeEvent
} from '@maplibre/maplibre-react-native'
import { useRef, useState } from 'react'
import { FilteredRegulatoryAreas } from '@features/RegulatoryAreas/FilteredRegulatoryAreas'
import { RegulatoryAreaDetails } from '@features/RegulatoryAreas/RegulatoryAreaDetails'
import { useRegulatoryAreasLayer } from '@features/RegulatoryAreas/Layers/RegulatoryAreasLayers'
import * as Sentry from '@sentry/react-native'
import { Image } from 'expo-image'
import { LoaderIcon } from '@components/LoaderIcon'
import { useGlobalStyle } from '@globalStyle'
import { Link, useRouter } from 'expo-router'

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
  const {
    cameraRef,
    clickedCoordinate,
    setClickedCoordinate,
    zoomOnRegulatoryArea,
    setIsFromFlyToBbox,
    isFromFlyToBbox
  } = useCameraContext()
  const globalStyle = useGlobalStyle()

  const { isLocationButtonEnabled, setActiveModal, activeModal, isRefreshingSettingsData } = useAppContext()
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

  const mapStyle: StyleSpecification = {
    ...baseMapStyle,
    layers: [
      ...baseMapStyle.layers,
      ...(isSearchZoneActive && areRegulatoryAreasLayerVisible ? regulatoryAreaLayer.layers : []),
      ...((isSearchZoneActive || activeModal === 'SEARCH_BY_QUERY_MODAL') && searchByZone.layer
        ? [searchByZone.layer]
        : []),
      ...(clickedCoordinate
        ? [
            {
              id: 'clickedPointLayer',
              layout: {
                'icon-allow-overlap': true,
                'icon-image': 'cursorIcon',
                'icon-size': 0.5
              },
              source: 'clickedPointSource',
              type: 'symbol'
            } as LayerSpecification
          ]
        : [])
    ],
    sources: {
      ...baseMapStyle.sources,
      ...(searchByZone.source && {
        [searchByZone.source.id]: searchByZone.source.definition
      }),
      ...(regulatoryAreaLayer.source && {
        [regulatoryAreaLayer.source.id]: regulatoryAreaLayer.source.definition
      }),
      ...(clickedCoordinate && {
        clickedPointSource: {
          data: {
            geometry: { coordinates: clickedCoordinate, type: 'Point' },
            properties: {},
            type: 'Feature'
          },
          type: 'geojson'
        }
      })
    }
  }

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

  const handleLocate = (coordinates: { longitude: number; latitude: number }) => {
    cameraRef.current?.flyTo({
      center: [coordinates.longitude, coordinates.latitude],
      duration: 900,
      easing: 'ease',
      zoom: LOCATION_FOCUS_ZOOM
    })
  }

  const onMapPress = async (event: NativeSyntheticEvent<PressEvent | PressEventWithFeatures>) => {
    if (!isSearchZoneActive) {
      return
    }

    const position = event.nativeEvent.point
    const coordinate = await mapRef.current?.unproject(position) // [lon, lat]
    setClickedCoordinate(coordinate)
    const features = await mapRef.current?.queryRenderedFeatures(position, {
      layers: [regulatoryAreaLayer.ids.fillLayer]
    })
    const clickedFeaturesIds = features?.map(feature => feature.properties?.id) ?? []
    const clickedRegulatoryAreas = regulatoryAreas.filter(area => clickedFeaturesIds.includes(area.id))

    if (clickedRegulatoryAreas.length === 1) {
      setSelectedRegulatoryArea(clickedRegulatoryAreas[0])
      setActiveModal('REGULATORY_AREA_DETAILS_MODAL')
      setClickedCoordinate(undefined)
      zoomOnRegulatoryArea(clickedRegulatoryAreas[0])
      return
    }

    const featuresToDisplay =
      clickedRegulatoryAreas && clickedRegulatoryAreas.length > 1 ? clickedRegulatoryAreas : undefined

    if (!featuresToDisplay) {
      return
    }
    setClickedFeaturesList(featuresToDisplay)
    setActiveModal('CLICKED_FEATURES_LIST_MODAL')
  }

  const searchByQuery = async () => {
    const bounds = await mapRef.current?.getBounds()
    if (!bounds) return undefined
    const [lonA, latA, lonB, latB] = bounds

    setCommittedSearchBbox({
      maxLat: Math.max(latA, latB),
      maxLon: Math.max(lonA, lonB),
      minLat: Math.min(latA, latB),
      minLon: Math.min(lonA, lonB)
    })

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

      {isLocationButtonEnabled && <UserLocation accuracy />}
      <Camera
        ref={cameraRef}
        initialViewState={{
          center: CENTERED_ON_FRANCE,
          zoom: 4
        }}
        maxBounds={[-180, -90, 180, 90]}
        trackUserLocation="default"
      />
      <SafeAreaView style={styles.safeArea} pointerEvents="box-none">
        <View style={styles.boutonsWrapper}>
          <SwitchContextButton />
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
        </View>

        <SelectedRegulatoryAreas
          isLoading={regulatoryAreaLayer.isLoading}
          setRegulatoryAreaDetailsOrigin={setRegulatoryAreaDetailsOrigin}
        />
        <FilteredRegulatoryAreas
          isLoading={regulatoryAreaLayer.isLoading}
          setRegulatoryAreaDetailsOrigin={setRegulatoryAreaDetailsOrigin}
        />
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
