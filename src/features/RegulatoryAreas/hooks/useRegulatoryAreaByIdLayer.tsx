import { useMemo } from 'react'

import { appModeConfigs, type AppMode } from '@config/appModes'
import { Colors } from '@constants/theme'
import { useAppContext } from '@contexts/AppContext'
import { useRegulatoryAreasContext } from '@contexts/RegulatoryAreasContext'
import { getRegulatoryAreaTilesUrlTemplate } from '../useCases/getRegulatoryAreaTilesUrlTemplate'

export type RegulatoryAreasLayerIds = {
  fillLayer: string
  outlineLayer: string
  source: string
}

// One source per mode: the native source ignores a new `tiles` URL once added to the map.
function buildLayerIds(mode: AppMode): RegulatoryAreasLayerIds {
  return {
    fillLayer: `regulatory-area-by-id-fill-${mode}`,
    outlineLayer: `regulatory-area-by-id-outline-${mode}`,
    source: `regulatory-area-by-id-source-${mode}`
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

function buildMatchingAreasFilter(id?: number): any {
  if (id === undefined) {
    return ['==', ['id'], -1] // ne matche rien
  }

  return ['==', ['get', 'id'], id]
}

export type RegulatoryAreasLayerProps = {
  ids: RegulatoryAreasLayerIds
  filter: any
  tilesUrlTemplate: string
}

export function useRegulatoryAreaByIdLayer(): RegulatoryAreasLayerProps {
  const { config } = useAppContext()

  const { isolatedRegulatoryAreaId, selectedRegulatoryArea } = useRegulatoryAreasContext()
  const regulatoryAreaId = useMemo(
    () => isolatedRegulatoryAreaId ?? selectedRegulatoryArea?.id,
    [isolatedRegulatoryAreaId, selectedRegulatoryArea?.id]
  )

  const ids = useMemo(() => buildLayerIds(config.mode), [config.mode])
  const tilesUrlTemplate = useMemo(() => getRegulatoryAreaTilesUrlTemplate(config.mode), [config.mode])
  const filter = useMemo(() => buildMatchingAreasFilter(regulatoryAreaId), [regulatoryAreaId])

  return {
    filter,
    ids,
    tilesUrlTemplate
  }
}
