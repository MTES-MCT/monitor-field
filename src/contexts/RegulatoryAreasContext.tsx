import type { BoundingBox } from '@/types/mapTypes'
import type { EnvRegulatoryArea, FishRegulatoryArea } from '@/types/regulatoryAreasTypes'
import { createContext, useContext, useState } from 'react'

export type RegulatoryAreaListItem = FishRegulatoryArea | EnvRegulatoryArea

export type Filters = {
  searchQuery: string | undefined
  recentlyAddedOrModified: boolean
  themesAndSubThemes: string[]
}

const RegulatoryAreasContext = createContext<
  | {
      searchBbox: BoundingBox | undefined
      setSearchBbox: (bbox: BoundingBox | undefined) => void
      committedSearchBbox: BoundingBox | undefined
      setCommittedSearchBbox: (bbox: BoundingBox | undefined) => void
      currentZoom: number | undefined
      setCurrentZoom: (zoom: number | undefined) => void
      committedSearchZoom: number | undefined
      setCommittedSearchZoom: (zoom: number | undefined) => void
      isSearchZoneActive: boolean
      setIsSearchZoneActive: (active: boolean) => void
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
  const [isSearchZoneActive, setIsSearchZoneActive] = useState(false)
  const [searchBbox, setSearchBbox] = useState<BoundingBox | undefined>(undefined)
  const [committedSearchBbox, setCommittedSearchBbox] = useState<BoundingBox | undefined>(undefined)
  const [currentZoom, setCurrentZoom] = useState<number | undefined>(undefined)
  const [committedSearchZoom, setCommittedSearchZoom] = useState<number | undefined>(undefined)
  const [totalCount, setTotalCount] = useState<number | undefined>(undefined)
  const [regulatoryAreas, setLocalRegulatoryAreas] = useState<RegulatoryAreaListItem[]>([])
  const [selectedRegulatoryArea, setSelectedRegulatoryArea] = useState<RegulatoryAreaListItem | undefined>(undefined)
  const [areRegulatoryAreasLayerVisible, setAreRegulatoryAreasLayerVisible] = useState(false)

  const [filters, setFilters] = useState<Filters>({
    recentlyAddedOrModified: false,
    searchQuery: undefined,
    themesAndSubThemes: []
  })

  const [clickedFeaturesList, setClickedFeaturesList] = useState<RegulatoryAreaListItem[] | undefined>(undefined)
  const [isolatedRegulatoryAreaId, setIsolatedRegulatoryAreaId] = useState<number | undefined>(undefined)

  const setRegulatoryAreas = (areas: RegulatoryAreaListItem[]) => {
    setLocalRegulatoryAreas(areas)
    setTotalCount(areas.length)
  }

  return (
    <RegulatoryAreasContext.Provider
      value={{
        areRegulatoryAreasLayerVisible,
        clickedFeaturesList,
        committedSearchBbox,
        committedSearchZoom,
        currentZoom,
        filters,
        isSearchZoneActive,
        isolatedRegulatoryAreaId,
        regulatoryAreas,
        searchBbox,
        selectedRegulatoryArea,
        setAreRegulatoryAreasLayerVisible,
        setClickedFeaturesList,
        setCommittedSearchBbox,
        setCommittedSearchZoom,
        setCurrentZoom,
        setFilters,
        setIsSearchZoneActive,
        setIsolatedRegulatoryAreaId,
        setRegulatoryAreas,
        setSearchBbox,
        setSelectedRegulatoryArea,
        totalCount
      }}
    >
      {children}
    </RegulatoryAreasContext.Provider>
  )
}

export function useRegulatoryAreasContext() {
  const ctx = useContext(RegulatoryAreasContext)
  if (!ctx) throw new Error('useRegulatoryAreasContext must be used within RegulatoryAreasProvider')
  return ctx
}
