import { BoundingBox } from "@/types/mapTypes";
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
