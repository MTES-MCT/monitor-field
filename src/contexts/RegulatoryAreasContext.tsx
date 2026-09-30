import type { BoundingBox } from '@/types/mapTypes'

import type { RegulatoryAreaFilters } from '@domain/entities/regulatoryAreas/RegulatoryAreaFilters'
import type { RegulatoryAreaSummary } from '@domain/entities/regulatoryAreas/RegulatoryAreaSummary'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ModalType } from './AppContext'
import { useDelayedLoading } from '@hooks/useDelayedLoading'

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
      isLoading: boolean
      setIsLoading: (loading: boolean) => void
      regulatoryAreaDetailsOrigin: ModalType | undefined
      setRegulatoryAreaDetailsOrigin: (origin: ModalType | undefined) => void
    }
  | undefined
>(undefined)

export function RegulatoryAreasProvider({ children }: { children: React.ReactNode }) {
  const [searchBbox, setSearchBbox] = useState<BoundingBox | undefined>(undefined)
  const [totalCount, setTotalCount] = useState<number | undefined>(undefined)
  const [regulatoryAreas, setLocalRegulatoryAreas] = useState<RegulatoryAreaListItem[]>([])
  const [selectedRegulatoryArea, setSelectedRegulatoryArea] = useState<RegulatoryAreaListItem | undefined>(undefined)
  const [areRegulatoryAreasLayerVisible, setAreRegulatoryAreasLayerVisible] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const showLoader = useDelayedLoading(isLoading, 1500)
  const [filters, setFilters] = useState<Filters>({
    recentlyAddedOrModified: false,
    searchQueryEnv: undefined,
    searchQueryFish: undefined,
    themes: []
  })

  const [clickedFeaturesList, setClickedFeaturesList] = useState<RegulatoryAreaListItem[] | undefined>(undefined)
  const [isolatedRegulatoryAreaId, setIsolatedRegulatoryAreaId] = useState<number | undefined>(undefined)

  const [regulatoryAreaDetailsOrigin, setRegulatoryAreaDetailsOrigin] = useState<ModalType>(undefined)

  const setRegulatoryAreas = useCallback((areas: RegulatoryAreaListItem[]) => {
    setLocalRegulatoryAreas(areas)
    setTotalCount(areas.length)
  }, [])

  // the whole map style.
  const value = useMemo(
    () => ({
      areRegulatoryAreasLayerVisible,
      clickedFeaturesList,
      filters,
      isLoading: showLoader,
      isolatedRegulatoryAreaId,
      regulatoryAreaDetailsOrigin,
      regulatoryAreas,
      searchBbox,
      selectedRegulatoryArea,
      setAreRegulatoryAreasLayerVisible,
      setClickedFeaturesList,
      setFilters,
      setIsLoading,
      setIsolatedRegulatoryAreaId,
      setRegulatoryAreaDetailsOrigin,
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
      setSearchBbox,
      totalCount,
      regulatoryAreaDetailsOrigin,
      setRegulatoryAreaDetailsOrigin,
      showLoader
    ]
  )

  return <RegulatoryAreasContext.Provider value={value}>{children}</RegulatoryAreasContext.Provider>
}

export function useRegulatoryAreasContext() {
  const ctx = useContext(RegulatoryAreasContext)
  if (!ctx) throw new Error('useRegulatoryAreasContext must be used within RegulatoryAreasProvider')
  return ctx
}
