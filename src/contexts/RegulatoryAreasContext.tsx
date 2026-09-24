import type { BoundingBox } from '@/types/mapTypes'
import type { RegulatoryAreaFilters } from '@domain/entities/regulatoryAreas/RegulatoryAreaFilters'
import type { RegulatoryAreaSummary } from '@domain/entities/regulatoryAreas/RegulatoryAreaSummary'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'

export type RegulatoryAreaListItem = RegulatoryAreaSummary

export type Filters = RegulatoryAreaFilters

const RegulatoryAreasContext = createContext<
  | {
      searchBbox: BoundingBox | undefined
      setSearchBbox: (bbox: BoundingBox | undefined) => void
      totalCount: number | undefined
      regulatoryAreas: RegulatoryAreaListItem[]
      setRegulatoryAreas: (areas: RegulatoryAreaListItem[]) => void
      selectedRegulatoryArea: RegulatoryAreaListItem | undefined
      setSelectedRegulatoryArea: (area: RegulatoryAreaListItem | undefined) => void
      filters: Filters
      setFilters: (filters: Filters | ((prevFilters: Filters) => Filters)) => void
      clickedFeaturesList: RegulatoryAreaListItem[] | undefined
      setClickedFeaturesList: (areas: RegulatoryAreaListItem[] | undefined) => void
      isolatedRegulatoryAreaId: number | undefined
      setIsolatedRegulatoryAreaId: (areaId: number | undefined) => void
      areRegulatoryAreasLayerVisible: boolean
      setAreRegulatoryAreasLayerVisible: (visible: boolean) => void
    }
  | undefined
>(undefined)

export function RegulatoryAreasProvider({ children }: { children: React.ReactNode }) {
  const [searchBbox, setSearchBbox] = useState<BoundingBox | undefined>(undefined)
  const [totalCount, setTotalCount] = useState<number | undefined>(undefined)
  const [regulatoryAreas, setLocalRegulatoryAreas] = useState<RegulatoryAreaListItem[]>([])
  const [selectedRegulatoryArea, setSelectedRegulatoryArea] = useState<RegulatoryAreaListItem | undefined>(undefined)
  const [areRegulatoryAreasLayerVisible, setAreRegulatoryAreasLayerVisible] = useState(true)

  const [filters, setFilters] = useState<Filters>({
    recentlyAddedOrModified: false,
    searchQuery: undefined,
    themesAndSubThemes: []
  })

  const [clickedFeaturesList, setClickedFeaturesList] = useState<RegulatoryAreaListItem[] | undefined>(undefined)
  const [isolatedRegulatoryAreaId, setIsolatedRegulatoryAreaId] = useState<number | undefined>(undefined)

  const setRegulatoryAreas = useCallback((areas: RegulatoryAreaListItem[]) => {
    setLocalRegulatoryAreas(areas)
    setTotalCount(areas.length)
  }, [])

  // Memoised: without it every state change here re-renders the map screen, which rebuilds
  // the whole map style.
  const value = useMemo(
    () => ({
      areRegulatoryAreasLayerVisible,
      clickedFeaturesList,
      filters,
      isolatedRegulatoryAreaId,
      regulatoryAreas,
      searchBbox,
      selectedRegulatoryArea,
      setAreRegulatoryAreasLayerVisible,
      setClickedFeaturesList,
      setFilters,
      setIsolatedRegulatoryAreaId,
      setRegulatoryAreas,
      setSearchBbox,
      setSelectedRegulatoryArea,
      totalCount
    }),
    [
      areRegulatoryAreasLayerVisible,
      clickedFeaturesList,
      filters,
      isolatedRegulatoryAreaId,
      regulatoryAreas,
      searchBbox,
      selectedRegulatoryArea,
      setRegulatoryAreas,
      totalCount
    ]
  )

  return <RegulatoryAreasContext.Provider value={value}>{children}</RegulatoryAreasContext.Provider>
}

export function useRegulatoryAreasContext() {
  const ctx = useContext(RegulatoryAreasContext)
  if (!ctx) throw new Error('useRegulatoryAreasContext must be used within RegulatoryAreasProvider')
  return ctx
}
