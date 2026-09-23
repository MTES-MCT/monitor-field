import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { BoundingBox } from '@/types/mapTypes'
import { useAppContext } from '@contexts/AppContext'
import { useRegulatoryAreasContext } from '@contexts/RegulatoryAreasContext'
import { getFishRegulatoryAreaIds, getFishRegulatoryAreas } from '../../useCases/getFishRegulatoryAreas'
import {
  getEnvRegulatoryAreaIds,
  getEnvRegulatoryAreas
} from '@features/RegulatoryAreas/useCases/getEnvRegulatoryAreas'
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
  hasActiveFilter: boolean
  ids: typeof regulatoryAreasIds
  isLoading: boolean
  tilesUrl: string
  visibleAreaIds: number[]
}

const LIST_REFRESH_DEBOUNCE_MS = 200

export function useRegulatoryAreasLayer(): RegulatoryAreasLayerProps {
  const [isLoading, setIsLoading] = useState(false)
  const [visibleAreaIds, setVisibleAreaIds] = useState<number[]>([])

  const { searchBbox, setRegulatoryAreas, filters } = useRegulatoryAreasContext()
  const { config } = useAppContext()

  const hasActiveFilter =
    !!filters.searchQuery?.trim() || filters.recentlyAddedOrModified || filters.themesAndSubThemes.length > 0

  const requestIdRef = useRef(0)
  const idRequestIdRef = useRef(0)
  const lastFetchParamsRef = useRef<{
    bbox: BoundingBox
    filters: typeof filters
    mode: typeof config.mode
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
      previous.mode === config.mode
    ) {
      return
    }
    lastFetchParamsRef.current = { bbox, filters, mode: config.mode }

    setIsLoading(true)

    const requestId = ++requestIdRef.current

    try {
      if (requestIdRef.current !== requestId) {
        return
      }

      const result =
        config.mode === 'MONITORFISH'
          ? await getFishRegulatoryAreas(bbox, filters)
          : await getEnvRegulatoryAreas(bbox, filters)

      if (requestIdRef.current === requestId) {
        setRegulatoryAreas(result)
      }
    } catch (error) {
      logSentryError(error, 'Failed to load regulatory areas')
    } finally {
      if (requestIdRef.current === requestId) {
        setIsLoading(false)
      }
    }
  }, [searchBbox, setRegulatoryAreas, filters, config.mode])

  // The list/search follow the live viewport: debounced so pan/zoom/typing don't hit SQLite every frame.
  useEffect(() => {
    const timer = setTimeout(fetch, LIST_REFRESH_DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [fetch])

  // The map filter needs the matching ids, regardless of viewport (the tiles already clip to the
  // screen), so it only refetches when the filters themselves change — no per-frame work on pan/zoom.
  useEffect(() => {
    const requestId = ++idRequestIdRef.current

    if (!hasActiveFilter) {
      setVisibleAreaIds([])
      return
    }

    const resolve = async () => {
      try {
        const ids =
          config.mode === 'MONITORFISH'
            ? await getFishRegulatoryAreaIds(filters)
            : await getEnvRegulatoryAreaIds(filters)

        if (idRequestIdRef.current === requestId) {
          setVisibleAreaIds(ids)
        }
      } catch (error) {
        logSentryError(error, 'Failed to resolve visible regulatory area ids')
      }
    }

    void resolve()
  }, [hasActiveFilter, filters, config.mode])

  const tilesUrl = useMemo(() => {
    const dataset = config.mode === 'MONITORFISH' ? 'fish' : 'env'

    return tileUrlTemplate(regulatoryTilesDirectory(dataset))
  }, [config.mode])

  return {
    hasActiveFilter,
    ids: regulatoryAreasIds,
    isLoading,
    tilesUrl,
    visibleAreaIds
  }
}
