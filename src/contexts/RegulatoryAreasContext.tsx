import { BoundingBox } from "@/types/MapTypes";
import { createContext, useContext, useState } from "react";

const RegulatoryAreasContext = createContext<
  | {
      searchBbox: BoundingBox | undefined;
      setSearchBbox: (bbox: BoundingBox | undefined) => void;
      committedSearchBbox: BoundingBox | undefined;
      setCommittedSearchBbox: (bbox: BoundingBox | undefined) => void;
      zoom: number | undefined;
      setZoom: (zoom: number | undefined) => void;
      isSearchZoneActive: boolean;
      setIsSearchZoneActive: (active: boolean) => void;
      hasSearchZoneChanged: boolean;
      setHasSearchZoneChanged: (changed: boolean) => void;
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
  const [zoom, setZoom] = useState<number | undefined>(undefined);
  const [hasSearchZoneChanged, setHasSearchZoneChanged] = useState(false);

  return (
    <RegulatoryAreasContext.Provider
      value={{
        searchBbox,
        setSearchBbox,
        committedSearchBbox,
        setCommittedSearchBbox,
        zoom,
        setZoom,
        isSearchZoneActive,
        setIsSearchZoneActive,
        hasSearchZoneChanged,
        setHasSearchZoneChanged,
      }}
    >
      {children}
    </RegulatoryAreasContext.Provider>
  );
}

export function useRegulatoryAreas() {
  const ctx = useContext(RegulatoryAreasContext);
  if (!ctx)
    throw new Error(
      "useRegulatoryAreas must be used within RegulatoryAreasProvider",
    );
  return ctx;
}
