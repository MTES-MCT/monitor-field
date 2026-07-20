import { useMemo } from 'react'

import { useRegulatoryAreasContext } from '@contexts/RegulatoryAreasContext'
import { useTheme } from '@hooks/use-theme'
import type { BoundingBox, GeoJSONFeature, MapLayer } from '@/types/mapTypes'

export const searchByZoneIds = {
  outlineLayer: 'search-by-zone-outline',
  source: 'search-by-zone-source'
}

const SEARCH_ZONE_INSET_RATIO = 0.05

export type SearchByZoneLayerProps = {
  source:
    | {
        id: string
        definition: {
          type: 'geojson'
          data: GeoJSONFeature
        }
      }
    | undefined
  layer: MapLayer | undefined
  ids: typeof searchByZoneIds
}

function bboxToGeoJSON(searchBbox: BoundingBox): GeoJSONFeature {
  const { minLon, minLat, maxLon, maxLat } = searchBbox

  return {
    geometry: {
      coordinates: [
        [
          [minLon, minLat],
          [maxLon, minLat],
          [maxLon, maxLat],
          [minLon, maxLat],
          [minLon, minLat]
        ]
      ],
      type: 'Polygon'
    },
    properties: {},
    type: 'Feature'
  }
}

function insetBoundingBox(searchBbox: BoundingBox): BoundingBox {
  const lonInset = (searchBbox.maxLon - searchBbox.minLon) * SEARCH_ZONE_INSET_RATIO
  const latInset = (searchBbox.maxLat - searchBbox.minLat) * SEARCH_ZONE_INSET_RATIO

  return {
    maxLat: searchBbox.maxLat - latInset,
    maxLon: searchBbox.maxLon - lonInset,
    minLat: searchBbox.minLat + latInset,
    minLon: searchBbox.minLon + lonInset
  }
}

function createSearchByZoneLayer(sourceId: string, color: string): MapLayer {
  return {
    id: searchByZoneIds.outlineLayer,
    paint: {
      'line-color': color,
      'line-dasharray': [2, 2],
      'line-width': 2
    },
    source: sourceId,
    type: 'line'
  }
}

export function useSearchByZoneLayer(): SearchByZoneLayerProps {
  const { searchBbox, committedSearchBbox, hasSearchZoneChanged } = useRegulatoryAreasContext()
  const theme = useTheme()

  const displayedBbox = hasSearchZoneChanged ? committedSearchBbox : searchBbox

  const geoJSON = useMemo(
    () => (displayedBbox ? bboxToGeoJSON(insetBoundingBox(displayedBbox)) : undefined),
    [displayedBbox]
  )

  if (!geoJSON) {
    return {
      ids: searchByZoneIds,
      layer: undefined,
      source: undefined
    }
  }

  return {
    ids: searchByZoneIds,
    layer: createSearchByZoneLayer(searchByZoneIds.source, theme.charcoal),
    source: {
      definition: {
        data: geoJSON,
        type: 'geojson'
      },
      id: searchByZoneIds.source
    }
  }
}
