import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { GeoJSONCollection, MapLayer } from '@/types/mapTypes'
import { useAppContext } from '@contexts/AppContext'
import { useRegulatoryAreasContext } from '@contexts/RegulatoryAreasContext'
import { useTheme } from '@hooks/use-theme'
import { getFishRegulatoryAreas } from '../../useCases/getFishRegulatoryAreas'
import { getEnvRegulatoryAreas } from '@features/RegulatoryAreas/useCases/getEnvRegulatoryAreas'

export const regulatoryAreasIds = {
  fillLayer: 'regulatory-areas-fill',
  outlineLayer: 'regulatory-areas-outline',
  source: 'regulatory-areas-source'
}

const DEFAULT_FISH_AREA_COLOR = '#67A9CF'
const OUTLINE_COLOR = '#05055eb3'

const fillColorExpression: any = ['coalesce', ['get', 'fillColor'], DEFAULT_FISH_AREA_COLOR]

export type RegulatoryAreasLayerProps = {
  isLoading: boolean
  source:
    | {
        id: string
        definition: {
          type: 'geojson'
          data: GeoJSONCollection
        }
      }
    | undefined
  layers: MapLayer[]
  ids: typeof regulatoryAreasIds
}

function createRegulatoryAreasLayers(
  sourceId: string,
  isolatedRegulatoryArea: number | undefined,
  selectedRegulatoryAreaId: number | undefined
): MapLayer[] {
  const fillOpacityExpression: any = !isolatedRegulatoryArea
    ? 0.4
    : ['case', ['==', ['get', 'id'], isolatedRegulatoryArea], 0.4, 0]

  const selectedExpression: any = !selectedRegulatoryAreaId
    ? 1
    : ['case', ['==', ['get', 'id'], selectedRegulatoryAreaId], 3, 1]

  const outlineWidthExpression: any =
    isolatedRegulatoryArea === undefined
      ? selectedExpression
      : ['case', ['==', ['get', 'id'], isolatedRegulatoryArea], 3, 1]
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

  const {
    isSearchZoneActive,
    searchBbox,
    committedSearchBbox,
    setRegulatoryAreas,
    selectedRegulatoryArea,
    filters,
    isolatedRegulatoryArea
  } = useRegulatoryAreasContext()
  const { config } = useAppContext()
  const theme = useTheme()
  const requestIdRef = useRef(0)

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
  }, [geoJSON, theme])

  const fetch = useCallback(async () => {
    const bbox = committedSearchBbox ?? searchBbox

    if (!bbox) {
      setGeoJSON(undefined)
      setRegulatoryAreas([])
      return
    }

    const requestId = ++requestIdRef.current
    setIsLoading(true)
    try {
      let result
      if (config.mode === 'MONITORFISH') {
        result = await getFishRegulatoryAreas(bbox, filters)
      } else {
        result = await getEnvRegulatoryAreas(bbox, filters)
      }

      if (requestIdRef.current !== requestId) {
        return
      }
      setRegulatoryAreas(result.listItems)
      setGeoJSON(result.geoJSON)
    } catch (error) {
      // oxlint-disable-next-line no-console
      console.warn('Failed to load regulatory areas', error)
    } finally {
      if (requestIdRef.current === requestId) {
        setIsLoading(false)
      }
    }
  }, [committedSearchBbox, searchBbox, setRegulatoryAreas, filters, config.mode])

  useEffect(() => {
    if (!isSearchZoneActive) {
      return
    }
    fetch()
  }, [searchBbox, filters, fetch, isSearchZoneActive])

  return {
    ids: regulatoryAreasIds,
    isLoading,
    layers: geoJSONWithResolvedFillColor
      ? createRegulatoryAreasLayers(regulatoryAreasIds.source, isolatedRegulatoryArea, selectedRegulatoryArea?.id)
      : [],
    source: {
      definition: {
        data: geoJSONWithResolvedFillColor ?? {
          features: [],
          type: 'FeatureCollection'
        },
        type: 'geojson'
      },
      id: regulatoryAreasIds.source
    }
  }
}
