import { BoundingBox } from "@/types/MapTypes";
import { createContext, useContext, useState } from "react";

export type RegulatoryAreaListItem = {
  id: number;
  type: string | undefined;
  theme: string | undefined;
  zone: string | undefined;
  bbox: BoundingBox;
  fillColor: string;
  isSelected: boolean;
};

export type Filters = {
  searchQuery: string | undefined;
};

const RegulatoryAreasContext = createContext<
  | {
      searchBbox: BoundingBox | undefined;
      setSearchBbox: (bbox: BoundingBox | undefined) => void;
      committedSearchBbox: BoundingBox | undefined;
      setCommittedSearchBbox: (bbox: BoundingBox | undefined) => void;
      isSearchZoneActive: boolean;
      setIsSearchZoneActive: (active: boolean) => void;
      hasSearchZoneChanged: boolean;
      setHasSearchZoneChanged: (changed: boolean) => void;
      totalCount: number | undefined;
      setTotalCount: (count: number | undefined) => void;
      regulatoryAreas: RegulatoryAreaListItem[];
      setRegulatoryAreas: (areas: RegulatoryAreaListItem[]) => void;
      selectedRegulatoryArea: RegulatoryAreaListItem | undefined;
      setSelectedRegulatoryArea: (
        area: RegulatoryAreaListItem | undefined,
      ) => void;
      filters: Filters;
      setFilters: (
        filters: Filters | ((prevFilters: Filters) => Filters),
      ) => void;
      isSearchByQueryActive: boolean;
      setIsSearchByQueryActive: (active: boolean) => void;
      clickedFeaturesList: RegulatoryAreaListItem[] | undefined;
      setClickedFeaturesList: (
        areas: RegulatoryAreaListItem[] | undefined,
      ) => void;
      isListVisible: boolean;
      setIsListVisible: (visible: boolean) => void;
    }
  | undefined
>(undefined);

export function RegulatoryAreasProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSearchZoneActive, setIsSearchZoneActive] = useState(false);
  const [searchBbox, setSearchBbox] = useState<BoundingBox | undefined>(
    undefined,
  );
  const [committedSearchBbox, setCommittedSearchBbox] = useState<
    BoundingBox | undefined
  >(undefined);
  const [hasSearchZoneChanged, setHasSearchZoneChanged] = useState(false);
  const [totalCount, setTotalCount] = useState<number | undefined>(undefined);
  const [regulatoryAreas, setRegulatoryAreas] = useState<
    RegulatoryAreaListItem[]
  >([]);
  const [selectedRegulatoryArea, setSelectedRegulatoryArea] = useState<
    RegulatoryAreaListItem | undefined
  >(undefined);

  const [filters, setFilters] = useState<Filters>({
    searchQuery: undefined,
  });

  const [isSearchByQueryActive, setIsSearchByQueryActive] = useState(false);
  const [clickedFeaturesList, setClickedFeaturesList] = useState<
    RegulatoryAreaListItem[] | undefined
  >(undefined);
  const [isListVisible, setIsListVisible] = useState(false);

  return (
    <RegulatoryAreasContext.Provider
      value={{
        searchBbox,
        setSearchBbox,
        committedSearchBbox,
        setCommittedSearchBbox,
        isSearchZoneActive,
        setIsSearchZoneActive,
        hasSearchZoneChanged,
        setHasSearchZoneChanged,
        totalCount,
        setTotalCount,
        regulatoryAreas,
        setRegulatoryAreas,
        selectedRegulatoryArea,
        setSelectedRegulatoryArea,
        filters,
        setFilters,
        isSearchByQueryActive,
        setIsSearchByQueryActive,
        clickedFeaturesList,
        setClickedFeaturesList,
        isListVisible,
        setIsListVisible,
      }}
    >
      {children}
    </RegulatoryAreasContext.Provider>
  );
}

export function useRegulatoryAreasContext() {
  const ctx = useContext(RegulatoryAreasContext);
  if (!ctx)
    throw new Error(
      "useRegulatoryAreasContext must be used within RegulatoryAreasProvider",
    );
  return ctx;
}
