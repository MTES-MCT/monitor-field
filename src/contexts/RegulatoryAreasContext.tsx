import { BoundingBox } from "@/types/MapTypes";
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

export type RegulatoryAreaListItem = {
  id: number;
  type: string | undefined;
  theme: string | undefined;
  zone: string | undefined;
  bbox: BoundingBox;
  fillColor: string;
  isSelected: boolean;
};

type RegulatoryModalHandlers = {
  presentList?: () => void;
  dismissList?: () => void;
  presentDetails?: () => void;
  dismissDetails?: () => void;
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
      registerRegulatoryModalHandlers: (
        handlers: RegulatoryModalHandlers,
      ) => () => void;
      openRegulatoryList: () => void;
      closeRegulatoryList: () => void;
      openRegulatoryDetails: () => void;
      closeRegulatoryDetails: () => void;
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
  const modalHandlersRef = useRef<RegulatoryModalHandlers>({});

  const registerRegulatoryModalHandlers = useCallback(
    (handlers: RegulatoryModalHandlers) => {
      modalHandlersRef.current = {
        ...modalHandlersRef.current,
        ...handlers,
      };

      return () => {
        const nextHandlers = { ...modalHandlersRef.current };
        (Object.keys(handlers) as (keyof RegulatoryModalHandlers)[]).forEach(
          (key) => {
            nextHandlers[key] = undefined;
          },
        );
        modalHandlersRef.current = nextHandlers;
      };
    },
    [],
  );

  const openRegulatoryList = useCallback(() => {
    modalHandlersRef.current.presentList?.();
  }, []);

  const closeRegulatoryList = useCallback(() => {
    modalHandlersRef.current.dismissList?.();
  }, []);

  const openRegulatoryDetails = useCallback(() => {
    modalHandlersRef.current.presentDetails?.();
  }, []);

  const closeRegulatoryDetails = useCallback(() => {
    modalHandlersRef.current.dismissDetails?.();
  }, []);

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
        registerRegulatoryModalHandlers,
        openRegulatoryList,
        closeRegulatoryList,
        openRegulatoryDetails,
        closeRegulatoryDetails,
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
