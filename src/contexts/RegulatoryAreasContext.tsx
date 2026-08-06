import type { BoundingBox } from '@/types/mapTypes'
import type { EnvRegulatoryArea, FishRegulatoryArea } from '@/types/regulatoryAreasTypes'
import { createContext, useContext, useState } from 'react'

export type RegulatoryAreaListItem = FishRegulatoryArea | EnvRegulatoryArea

export type Filters = {
  searchQuery: string | undefined
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
      hasSearchZoneChanged: boolean
      setHasSearchZoneChanged: (changed: boolean) => void
      totalCount: number | undefined
      regulatoryAreas: RegulatoryAreaListItem[]
      setRegulatoryAreas: (areas: RegulatoryAreaListItem[]) => void
      selectedRegulatoryArea: RegulatoryAreaListItem | undefined
      setSelectedRegulatoryArea: (area: RegulatoryAreaListItem | undefined) => void
      filters: Filters
      setFilters: (filters: Filters | ((prevFilters: Filters) => Filters)) => void
      isSearchByQueryActive: boolean
      setIsSearchByQueryActive: (active: boolean) => void
      clickedFeaturesList: RegulatoryAreaListItem[] | undefined
      setClickedFeaturesList: (areas: RegulatoryAreaListItem[] | undefined) => void
      isListVisible: boolean
      setIsListVisible: (visible: boolean) => void
      resetContext: () => void
      isolatedRegulatoryArea: number | undefined
      setIsolatedRegulatoryArea: (areaId: number | undefined) => void
    }
  | undefined
>(undefined)

export function RegulatoryAreasProvider({ children }: { children: React.ReactNode }) {
  const [isSearchZoneActive, setIsSearchZoneActive] = useState(false)
  const [searchBbox, setSearchBbox] = useState<BoundingBox | undefined>(undefined)
  const [committedSearchBbox, setCommittedSearchBbox] = useState<BoundingBox | undefined>(undefined)
  const [currentZoom, setCurrentZoom] = useState<number | undefined>(undefined)
  const [committedSearchZoom, setCommittedSearchZoom] = useState<number | undefined>(undefined)
  const [hasSearchZoneChanged, setHasSearchZoneChanged] = useState(false)
  const [totalCount, setTotalCount] = useState<number | undefined>(undefined)
  const [regulatoryAreas, setLocalRegulatoryAreas] = useState<RegulatoryAreaListItem[]>([])
  const [selectedRegulatoryArea, setSelectedRegulatoryArea] = useState<RegulatoryAreaListItem | undefined>(undefined)

  const [filters, setFilters] = useState<Filters>({
    searchQuery: undefined
  })

  const [isSearchByQueryActive, setIsSearchByQueryActive] = useState(false)
  const [clickedFeaturesList, setClickedFeaturesList] = useState<RegulatoryAreaListItem[] | undefined>(undefined)
  const [isListVisible, setIsListVisible] = useState(false)
  const [isolatedRegulatoryArea, setIsolatedRegulatoryArea] = useState<number | undefined>(undefined)

  const resetContext = () => {
    setIsSearchZoneActive(false)
    setHasSearchZoneChanged(false)
    setTotalCount(undefined)
    setLocalRegulatoryAreas([])
    setSelectedRegulatoryArea(undefined)
    setFilters({ searchQuery: undefined })
    setIsSearchByQueryActive(false)
    setClickedFeaturesList(undefined)
    setIsListVisible(false)
    setCurrentZoom(undefined)
  }

  const setRegulatoryAreas = (areas: RegulatoryAreaListItem[]) => {
    setLocalRegulatoryAreas(areas)
    setTotalCount(areas.length)
  }

  return (
    <RegulatoryAreasContext.Provider
      value={{
        clickedFeaturesList,
        committedSearchBbox,
        committedSearchZoom,
        currentZoom,
        filters,
        hasSearchZoneChanged,
        isListVisible,
        isSearchByQueryActive,
        isSearchZoneActive,
        isolatedRegulatoryArea,
        regulatoryAreas,
        resetContext,
        searchBbox,
        selectedRegulatoryArea,
        setClickedFeaturesList,
        setCommittedSearchBbox,
        setCommittedSearchZoom,
        setCurrentZoom,
        setFilters,
        setHasSearchZoneChanged,
        setIsListVisible,
        setIsSearchByQueryActive,
        setIsSearchZoneActive,
        setIsolatedRegulatoryArea,
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
