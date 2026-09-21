import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAppContext } from '@contexts/AppContext'
import { useRegulatoryAreasContext } from '@contexts/RegulatoryAreasContext'
import type { GeoJSONFeature, MapLayer } from '@/types/mapTypes'
import {
  fillColorExpression,
  DEFAULT_FISH_AREA_COLOR,
  OUTLINE_COLOR
} from '@features/RegulatoryAreas/Layers/RegulatoryAreasLayers'
import { logSentryError } from '@utils/sentryLogger'
import { useTheme } from '@hooks/use-theme'
import { getEnvRegulatoryAreaById } from '@features/RegulatoryAreas/useCases/getEnvRegulatoryAreaById'
import { getFishRegulatoryAreaById } from '@features/RegulatoryAreas/useCases/getFishRegulatoryAreaById'

export const regulatoryAreaIds = {
  fillLayer: 'regulatory-area-fill',
  outlineLayer: 'regulatory-area-outline',
  source: 'regulatory-area-source'
}

export type RegulatoryAreaLayerProps = {
  source:
    | {
        id: string
        definition: {
          type: 'geojson'
          data: GeoJSONFeature
        }
      }
    | undefined
  layers: MapLayer[]
  ids: typeof regulatoryAreaIds | undefined
}

function createRegulatoryAreasLayers(sourceId: string): MapLayer[] {
  return [
    {
      id: regulatoryAreaIds.fillLayer,
      paint: {
        'fill-color': fillColorExpression,
        'fill-opacity': 0.4
      },
      source: sourceId,
      type: 'fill'
    },
    {
      id: regulatoryAreaIds.outlineLayer,
      paint: {
        'line-color': OUTLINE_COLOR,
        'line-width': 3
      },
      source: sourceId,
      type: 'line'
    }
  ]
}

const LAYERS = createRegulatoryAreasLayers(regulatoryAreaIds.source)
export function useSelectedRegulatoryAreaLayer(): RegulatoryAreaLayerProps {
  const { selectedRegulatoryArea, isolatedRegulatoryAreaId } = useRegulatoryAreasContext()
  const theme = useTheme()
  const { config } = useAppContext()

  const id = useMemo(
    () => selectedRegulatoryArea?.id ?? isolatedRegulatoryAreaId,
    [selectedRegulatoryArea, isolatedRegulatoryAreaId]
  )

  const [regulatoryAreaFeature, setRegulatoryAreaFeature] = useState<GeoJSONFeature>({
    geometry: {
      coordinates: [],
      type: 'Polygon'
    },
    properties: {},
    type: 'Feature'
  } as GeoJSONFeature)

  const fetch = useCallback(
    async id => {
      try {
        let result

        if (config.mode === 'MONITORENV') {
          result = await getEnvRegulatoryAreaById(id)
        } else {
          result = await getFishRegulatoryAreaById(id)
        }

        if (!result?.geoJSON) {
          return
        }

        const resolvedFillColor =
          theme[result.geoJSON?.properties?.fillColor as keyof typeof theme] ?? DEFAULT_FISH_AREA_COLOR

        setRegulatoryAreaFeature({
          ...result.geoJSON,
          properties: {
            ...result.geoJSON?.properties,
            fillColor: resolvedFillColor
          }
        })
      } catch (error) {
        logSentryError(error, 'Failed to load regulatory area with id ' + id)
      }
    },
    [theme, config.mode]
  )

  useEffect(() => {
    if (!id) {
      return
    }

    fetch(id)
  }, [id, fetch])

  if (!id || !regulatoryAreaFeature) {
    return {
      ids: regulatoryAreaIds,
      layers: [],
      source: undefined
    }
  }

  return {
    ids: regulatoryAreaIds,
    layers: LAYERS,
    source: {
      definition: {
        data: regulatoryAreaFeature,
        type: 'geojson'
      },
      id: regulatoryAreaIds.source
    }
  }
}
