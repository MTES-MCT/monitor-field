import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { BoundingBox, GeoJSONCollection, MapLayer } from '@/types/mapTypes'
import { useAppContext } from '@contexts/AppContext'
import { useRegulatoryAreasContext } from '@contexts/RegulatoryAreasContext'
import { useTheme } from '@hooks/use-theme'
import { getFishRegulatoryAreas } from '../../useCases/getFishRegulatoryAreas'
import { getEnvRegulatoryAreas } from '@features/RegulatoryAreas/useCases/getEnvRegulatoryAreas'
import { logSentryError } from '@utils/sentryLogger'
import { regulatoryTilesDirectory, tileUrlTemplate } from '@infrastructure/tiles/vectorTileStore'
import { usePathname } from 'expo-router'
import isEqual from 'lodash/isEqual'

export const regulatoryAreasIds = {
  fillLayer: 'regulatory-areas-fill',
  outlineLayer: 'regulatory-areas-outline',
  source: 'regulatory-areas-source'
}

export const DEFAULT_FISH_AREA_COLOR = '#67A9CF'
export const OUTLINE_COLOR = '#05055eb3'

export const fillColorExpression: any = ['coalesce', ['get', 'fillColor'], DEFAULT_FISH_AREA_COLOR]

export type RegulatoryAreasLayerProps = {
  isLoading: boolean
  geoJSON: GeoJSONCollection | undefined
  geoJSONString: string | undefined
  layers: MapLayer[]
  tilesUrl: string
  ids: typeof regulatoryAreasIds
}

function createRegulatoryAreasLayers(
  sourceId: string,
  isolatedRegulatoryAreaId: number | undefined,
  selectedRegulatoryAreaId: number | undefined
): MapLayer[] {
  const isIsolated: boolean = !!isolatedRegulatoryAreaId || !!selectedRegulatoryAreaId
  const isolatedRegulatoryAreaIdToUse: number | undefined = isolatedRegulatoryAreaId ?? selectedRegulatoryAreaId
  const fillOpacityExpression: any = !isIsolated
    ? 0.4
    : ['case', ['==', ['get', 'id'], isolatedRegulatoryAreaIdToUse], 0.4, 0]

  const selectedExpression: any = !selectedRegulatoryAreaId
    ? 1
    : ['case', ['==', ['get', 'id'], selectedRegulatoryAreaId], 3, 1]

  const outlineWidthExpression: any = !isIsolated
    ? selectedExpression
    : ['case', ['==', ['get', 'id'], isolatedRegulatoryAreaIdToUse], 3, 1]

  return [
    {
      id: regulatoryAreasIds.fillLayer,
      paint: {
        'fill-color': fillColorExpression,
        'fill-opacity': fillOpacityExpression
      },
      source: sourceId,
      type: 'fill'
    },
    {
      id: regulatoryAreasIds.outlineLayer,
      paint: {
        'line-color': OUTLINE_COLOR,
        'line-width': outlineWidthExpression
      },
      source: sourceId,
      type: 'line'
    }
  ]
}

export function useRegulatoryAreasLayer(): RegulatoryAreasLayerProps {
  const [geoJSON, setGeoJSON] = useState<GeoJSONCollection | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)

  const pathname = usePathname()

  const {
    isSearchZoneActive,
    committedSearchBbox,
    committedSearchZoom,
    setRegulatoryAreas,
    selectedRegulatoryArea,
    filters,
    isolatedRegulatoryAreaId
  } = useRegulatoryAreasContext()
  const { config } = useAppContext()
  const theme = useTheme()
  const requestIdRef = useRef(0)
  const lastFetchParamsRef = useRef<{
    bbox: BoundingBox
    filters: typeof filters
    mode: typeof config.mode
    zoom: number | undefined
  } | null>(null)

  const geoJSONWithResolvedFillColor = useMemo(() => {
    if (!geoJSON) {
      return undefined
    }

    return {
      ...geoJSON,
      features: geoJSON.features.map(feature => {
        const resolvedFillColor = theme[feature.properties?.fillColor as keyof typeof theme] ?? DEFAULT_FISH_AREA_COLOR

        return {
          ...feature,
          properties: {
            ...feature.properties,
            fillColor: resolvedFillColor
          }
        }
      })
    }
    // added config.mode to prevent features of the previous context
    // from being displayed before the new ones are generated
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geoJSON, theme, config.mode])

  const fetch = useCallback(async () => {
    const bbox = committedSearchBbox
    if (!bbox) {
      lastFetchParamsRef.current = null
      setGeoJSON(undefined)
      setRegulatoryAreas([])
      return
    }

    // skip refetching when the bbox, filters and mode didn't actually change (only references may have)
    const previous = lastFetchParamsRef.current
    if (
      previous &&
      isEqual(previous.bbox, bbox) &&
      isEqual(previous.filters, filters) &&
      previous.mode === config.mode &&
      previous.zoom === committedSearchZoom
    ) {
      return
    }
    lastFetchParamsRef.current = { bbox, filters, mode: config.mode, zoom: committedSearchZoom }

    setIsLoading(true)

    const requestId = ++requestIdRef.current

    try {
      if (requestIdRef.current !== requestId) {
        return
      }

      let result
      if (config.mode === 'MONITORFISH') {
        result = await getFishRegulatoryAreas(bbox, filters, committedSearchZoom)
      } else {
        result = await getEnvRegulatoryAreas(bbox, filters, committedSearchZoom)
      }

      setRegulatoryAreas(result.listItems)
      setGeoJSON(result.geoJSON)
    } catch (error) {
      logSentryError(error, 'Failed to load regulatory areas')
    } finally {
      if (requestIdRef.current === requestId) {
        setIsLoading(false)
      }
    }
  }, [committedSearchBbox, committedSearchZoom, setRegulatoryAreas, filters, config.mode, setGeoJSON])

  useEffect(() => {
    if (!isSearchZoneActive && pathname === '/search' && !filters.searchQuery?.trim()) {
      return
    }

    fetch()
  }, [fetch, isSearchZoneActive, pathname, filters.searchQuery])

  // Both are memoised: Prevent rebuilding map style on every render
  // (would re-serialise the whole FeatureCollection across the bridge on any state change).
  const layers = useMemo(
    () =>
      geoJSONWithResolvedFillColor
        ? createRegulatoryAreasLayers(regulatoryAreasIds.source, isolatedRegulatoryAreaId, selectedRegulatoryArea?.id)
        : [],
    [geoJSONWithResolvedFillColor, isolatedRegulatoryAreaId, selectedRegulatoryArea?.id]
  )

  const geoJSONString = useMemo(
    () => (geoJSONWithResolvedFillColor ? JSON.stringify(geoJSONWithResolvedFillColor) : undefined),
    [geoJSONWithResolvedFillColor]
  )

  const tilesUrl = useMemo(() => {
    const dataset = config.mode === 'MONITORFISH' ? 'fish' : 'env'

    return tileUrlTemplate(regulatoryTilesDirectory(dataset))
  }, [config.mode])

  return {
    geoJSON: geoJSONWithResolvedFillColor,
    geoJSONString,
    ids: regulatoryAreasIds,
    isLoading,
    layers,
    tilesUrl
  }
}
