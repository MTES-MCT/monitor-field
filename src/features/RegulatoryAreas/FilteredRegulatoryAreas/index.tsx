import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useEffect, useMemo, useRef } from "react";
import { RegulatoryAreasList } from "../RegulatoryAreasList";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BoundingBox } from "@/types/MapTypes";
import { useRegulatoryAreasContext } from "@contexts/RegulatoryAreasContext";
import { useAppContext } from "@contexts/AppContext";
import { RegulatoryAreaDetails } from "../SelectedRegulatoryAreas/RegulatoryAreaDetails";
import { Search } from "./Search";

type FilteredRegulatoryAreasProps = {
  onGroupFocus?: (bbox: BoundingBox) => void;
};

export const FilteredRegulatoryAreas = ({
  onGroupFocus,
}: FilteredRegulatoryAreasProps) => {
  const {
    selectedRegulatoryArea,
    setIsSearchByQueryActive,
    isSearchByQueryActive,
  } = useRegulatoryAreasContext();
  const {
    registerRegulatoryModalHandlers,
    openRegulatoryModalFromFilterButtons,
  } = useAppContext();

  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ["25%", "66%", "99%"], []);
  const modalRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    return registerRegulatoryModalHandlers({
      presentList: () => modalRef.current?.present(),
      dismissList: () => modalRef.current?.dismiss(),
    });
  }, [registerRegulatoryModalHandlers]);

  return (
    <BottomSheetModal
      ref={modalRef}
      snapPoints={snapPoints}
      index={isSearchByQueryActive ? 2 : 1}
      enableDynamicSizing={false}
      enablePanDownToClose
      topInset={insets.top}
      onDismiss={() => {
        setIsSearchByQueryActive(false);
      }}
    >
      {selectedRegulatoryArea ? (
        <RegulatoryAreaDetails regulatoryArea={selectedRegulatoryArea} />
      ) : (
        <>
          <Search />
          <RegulatoryAreasList
            onGroupFocus={onGroupFocus}
            onSelectArea={openRegulatoryModalFromFilterButtons}
          />
        </>
      )}
    </BottomSheetModal>
  );
};
