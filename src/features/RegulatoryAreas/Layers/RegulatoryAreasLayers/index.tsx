import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { BoundingBox } from '@/types/mapTypes'
import { useAppContext } from '@contexts/AppContext'
import { useRegulatoryAreasContext } from '@contexts/RegulatoryAreasContext'
import { getFishRegulatoryAreas } from '../../useCases/getFishRegulatoryAreas'
import { getEnvRegulatoryAreas } from '@features/RegulatoryAreas/useCases/getEnvRegulatoryAreas'
import { logSentryError } from '@utils/sentryLogger'
import { regulatoryTilesDirectory, tileUrlTemplate } from '@infrastructure/tiles/vectorTileStore'
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
  tilesUrl: string
  ids: typeof regulatoryAreasIds
}

const LIST_REFRESH_DEBOUNCE_MS = 200

export function useRegulatoryAreasLayer(): RegulatoryAreasLayerProps {
  const [isLoading, setIsLoading] = useState(false)

  const { searchBbox, currentZoom, setRegulatoryAreas, filters } = useRegulatoryAreasContext()
  const { config } = useAppContext()

  const requestIdRef = useRef(0)
  const lastFetchParamsRef = useRef<{
    bbox: BoundingBox
    filters: typeof filters
    mode: typeof config.mode
    zoom: number | undefined
  } | null>(null)

  const fetch = useCallback(async () => {
    const bbox = searchBbox
    if (!bbox) {
      lastFetchParamsRef.current = null
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
      previous.zoom === currentZoom
    ) {
      return
    }
    lastFetchParamsRef.current = { bbox, filters, mode: config.mode, zoom: currentZoom }

    setIsLoading(true)

    const requestId = ++requestIdRef.current

    try {
      if (requestIdRef.current !== requestId) {
        return
      }

      const result =
        config.mode === 'MONITORFISH'
          ? await getFishRegulatoryAreas(bbox, filters, currentZoom)
          : await getEnvRegulatoryAreas(bbox, filters, currentZoom)

      if (requestIdRef.current === requestId) {
        setRegulatoryAreas(result.listItems)
      }
    } catch (error) {
      logSentryError(error, 'Failed to load regulatory areas')
    } finally {
      if (requestIdRef.current === requestId) {
        setIsLoading(false)
      }
    }
  }, [searchBbox, currentZoom, setRegulatoryAreas, filters, config.mode])

  // The list/search follow the live viewport: debounced so pan/zoom/typing don't hit SQLite every frame.
  useEffect(() => {
    const timer = setTimeout(fetch, LIST_REFRESH_DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [fetch])

  const tilesUrl = useMemo(() => {
    const dataset = config.mode === 'MONITORFISH' ? 'fish' : 'env'

    return tileUrlTemplate(regulatoryTilesDirectory(dataset))
  }, [config.mode])

  return {
    ids: regulatoryAreasIds,
    isLoading,
    tilesUrl
  }
}
