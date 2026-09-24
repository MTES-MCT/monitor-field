import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { BoundingBox } from '@/types/mapTypes'
import { appModeConfigs, type AppMode } from '@config/appModes'
import { Colors } from '@constants/theme'
import { useAppContext } from '@contexts/AppContext'
import { useRegulatoryAreasContext } from '@contexts/RegulatoryAreasContext'
import { hasActiveRegulatoryAreaFilters } from '@domain/entities/regulatoryAreas/RegulatoryAreaFilters'
import { getMatchingRegulatoryAreaIds } from '../useCases/getMatchingRegulatoryAreaIds'
import { getRegulatoryAreasInBoundingBox } from '../useCases/getRegulatoryAreasInBoundingBox'
import { getRegulatoryAreaTilesUrlTemplate } from '../useCases/getRegulatoryAreaTilesUrlTemplate'
import { logSentryError } from '@utils/sentryLogger'
import isEqual from 'lodash/isEqual'

export type RegulatoryAreasLayerIds = {
  fillLayer: string
  outlineLayer: string
  source: string
}

// One source per mode: the native source ignores a new `tiles` URL once added to the map.
function buildLayerIds(mode: AppMode): RegulatoryAreasLayerIds {
  return {
    fillLayer: `regulatory-areas-fill-${mode}`,
    outlineLayer: `regulatory-areas-outline-${mode}`,
    source: `regulatory-areas-source-${mode}`
  }
}

export const DEFAULT_AREA_COLOR = '#67A9CF'
export const OUTLINE_COLOR = '#05055eb3'

function buildFillColorExpression(): any {
  const paletteKeys = [...new Set(Object.values(appModeConfigs).flatMap(config => config.colors))]
  const cases = paletteKeys.flatMap(key => {
    const color = Colors.light[key as keyof typeof Colors.light]

    return color ? [key, color] : []
  })

  return ['match', ['coalesce', ['get', 'colorKey'], ''], ...cases, DEFAULT_AREA_COLOR]
}

export const fillColorExpression: any = buildFillColorExpression()

function buildMatchingAreasFilter(hasActiveFilter: boolean, matchingAreaIds: number[]): any {
  if (!hasActiveFilter) {
    return undefined
  }

  if (matchingAreaIds.length === 0) {
    // An active filter with no matches: hide every feature (area ids are positive).
    return ['==', ['id'], -1]
  }

  return ['match', ['id'], ...matchingAreaIds.flatMap(id => [id, true]), false]
}

export type RegulatoryAreasLayerProps = {
  filter: any
  ids: RegulatoryAreasLayerIds
  isLoading: boolean
  tilesUrlTemplate: string
}

const LIST_REFRESH_DEBOUNCE_MS = 200

export function useRegulatoryAreasLayer(): RegulatoryAreasLayerProps {
  const [isLoading, setIsLoading] = useState(false)
  const [matchingAreaIds, setMatchingAreaIds] = useState<number[]>([])

  const { searchBbox, setRegulatoryAreas, filters } = useRegulatoryAreasContext()
  const { config } = useAppContext()

  const hasActiveFilter = hasActiveRegulatoryAreaFilters(filters, config.mode)

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

    // Only the references may have changed.
    const previous = lastFetchParamsRef.current
    if (
      previous &&
      isEqual(previous.bbox, bbox) &&
      isEqual(previous.filters, filters) &&
      previous.mode === config.mode
    ) {
      return
    }
    lastFetchParamsRef.current = {
      bbox,
      filters,
      mode: config.mode
    }

    setIsLoading(true)

    const requestId = ++requestIdRef.current

    try {
      if (requestIdRef.current !== requestId) {
        return
      }

      const result = await getRegulatoryAreasInBoundingBox(config.mode, bbox, filters)

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

  // Not tied to the viewport (the tiles already clip to it): no refetch on pan/zoom.
  useEffect(() => {
    const requestId = ++idRequestIdRef.current

    if (!hasActiveFilter) {
      setMatchingAreaIds([])
      return
    }

    const resolve = async () => {
      try {
        const ids = await getMatchingRegulatoryAreaIds(config.mode, filters)

        if (idRequestIdRef.current === requestId) {
          setMatchingAreaIds(ids)
        }
      } catch (error) {
        logSentryError(error, 'Failed to resolve visible regulatory area ids')
      }
    }

    void resolve()
  }, [hasActiveFilter, filters, config.mode])

  const ids = useMemo(() => buildLayerIds(config.mode), [config.mode])
  const tilesUrlTemplate = useMemo(() => getRegulatoryAreaTilesUrlTemplate(config.mode), [config.mode])

  const filter = useMemo(
    () => buildMatchingAreasFilter(hasActiveFilter, matchingAreaIds),
    [hasActiveFilter, matchingAreaIds]
  )

  return {
    filter,
    ids,
    isLoading,
    tilesUrlTemplate
  }
}
