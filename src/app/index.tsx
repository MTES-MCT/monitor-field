import { StyleSheet, View, type NativeSyntheticEvent } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { MaxContentWidth, Spacing } from '@constants/theme'
import { useAppContext } from '@contexts/AppContext'

import { type BoundingBox } from '@/types/mapTypes'
import { BottomBar } from '@components/BottomBar'
import { useSearchByZoneLayer } from '@components/Layers/useSearchByZoneLayer'
import { LocationButton } from '@components/Buttons/LocationButton'
import { SwitchContextButton } from '@components/Buttons/SwitchContextButton'
import { useRegulatoryAreasContext } from '@contexts/RegulatoryAreasContext'
import { SelectedRegulatoryAreas } from '@features/RegulatoryAreas/SelectedRegulatoryAreas'
import {
  Camera,
  Map as MapLibreMap,
  UserLocation,
  type CameraRef,
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
import { Settings } from '@features/Settings'
import * as Sentry from '@sentry/react-native'

const ENV = process.env.EXPO_PUBLIC_SENTRY_ENV
const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN

Sentry.init({
  attachStacktrace: false,
  dsn: SENTRY_DSN,
  enableAutoSessionTracking: false,
  enableLogs: false,
  environment: ENV,
  sendDefaultPii: false
})

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
      tiles: ['https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'],
      type: 'raster'
    }
  },
  version: 8
}

const LOCATION_FOCUS_ZOOM = 35

function App() {
  const mapRef = useRef<MapRef>(null)
  const cameraRef = useRef<CameraRef>(null)
  const { isLocationButtonEnabled } = useAppContext()
  const {
    isSearchZoneActive,
    setHasSearchZoneChanged,
    setSearchBbox,
    setCurrentZoom,
    regulatoryAreas,
    setSelectedRegulatoryArea,
    setIsSearchByQueryActive,
    setClickedFeaturesList,
    setIsListVisible
  } = useRegulatoryAreasContext()

  const [isFromFlyToBbox, setIsFromFlyToBbox] = useState(false)

  const regulatoryAreaLayer = useRegulatoryAreasLayer()
  const searchByZone = useSearchByZoneLayer()

  const mapStyle: StyleSpecification = {
    ...baseMapStyle,
    layers: [
      ...baseMapStyle.layers,
      ...(isSearchZoneActive ? regulatoryAreaLayer.layers : []),
      ...(isSearchZoneActive && searchByZone.layer ? [searchByZone.layer] : [])
    ],
    sources: {
      ...baseMapStyle.sources,
      ...(isSearchZoneActive &&
        searchByZone.source && {
          [searchByZone.source.id]: searchByZone.source.definition
        }),
      ...(regulatoryAreaLayer.source && {
        [regulatoryAreaLayer.source.id]: regulatoryAreaLayer.source.definition
      })
    }
  }

  const onRegionDidChange = async (event: NativeSyntheticEvent<ViewStateChangeEvent>) => {
    setCurrentZoom(event.nativeEvent.zoom)

    if (isFromFlyToBbox) {
      setIsFromFlyToBbox(false)
      return
    }

    if (isSearchZoneActive) {
      setHasSearchZoneChanged(true)
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

  const onFocusRegulatoryArea = (bbox: BoundingBox | undefined) => {
    if (!bbox) {
      return
    }

    cameraRef.current?.fitBounds([bbox.minLon, bbox.minLat, bbox.maxLon, bbox.maxLat], {
      duration: 700,
      easing: 'ease',
      padding: {
        bottom: 540,
        left: 40,
        right: 40,
        top: 40
      }
    })
  }

  const flyToBbox = (centerLat: number, centerLon: number, zoom: number | undefined) => {
    cameraRef.current?.flyTo({
      center: [centerLon, centerLat],
      duration: 900,
      easing: 'ease',
      ...(zoom !== undefined && { zoom })
    })
    setIsFromFlyToBbox(true)
  }

  const onMapPress = async (event: NativeSyntheticEvent<PressEvent | PressEventWithFeatures>) => {
    if (!isSearchZoneActive) {
      return
    }

    const position = event.nativeEvent.point
    const features = await mapRef.current?.queryRenderedFeatures(position, {
      layers: [regulatoryAreaLayer.ids.fillLayer]
    })
    const clickedFeaturesIds = features?.map(feature => feature.properties?.id) ?? []
    const clickedRegulatoryAreas = regulatoryAreas.filter(area => clickedFeaturesIds.includes(area.id))

    const featuresToDisplay =
      clickedRegulatoryAreas && clickedRegulatoryAreas.length > 1 ? clickedRegulatoryAreas : undefined
    setClickedFeaturesList(featuresToDisplay)

    const selectedFeature =
      !clickedRegulatoryAreas || clickedRegulatoryAreas.length > 1 ? undefined : clickedRegulatoryAreas[0]
    setSelectedRegulatoryArea(selectedFeature)

    if (clickedRegulatoryAreas.length === 1) {
      onFocusRegulatoryArea(clickedRegulatoryAreas[0]?.bbox)
    }
  }

  const consultRegulatoryAreas = () => {
    setClickedFeaturesList(undefined)
    setSelectedRegulatoryArea(undefined)
    setIsListVisible(true)
    setIsSearchByQueryActive(false)
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
      {isLocationButtonEnabled && <UserLocation accuracy />}
      <Camera
        ref={cameraRef}
        initialViewState={
          isLocationButtonEnabled
            ? undefined
            : {
                center: CENTERED_ON_FRANCE,
                zoom: 4
              }
        }
        maxBounds={[-180, -90, 180, 90]}
        trackUserLocation={isLocationButtonEnabled ? 'default' : undefined}
      />
      <SafeAreaView style={styles.safeArea} pointerEvents="box-none">
        <View style={styles.boutonsWrapper}>
          <SwitchContextButton />
          <Settings />
        </View>

        <SelectedRegulatoryAreas onFocusRegulatoryArea={onFocusRegulatoryArea} />

        <FilteredRegulatoryAreas onFocusRegulatoryArea={onFocusRegulatoryArea} />

        <RegulatoryAreaDetails />
        <View style={styles.bottomWrapper}>
          <LocationButton onLocate={handleLocate} />
          <BottomBar consultRegulatoryAreas={consultRegulatoryAreas} zoomToBbox={flyToBbox} />
        </View>
      </SafeAreaView>
    </MapLibreMap>
  )
}

export default Sentry.wrap(App)

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
