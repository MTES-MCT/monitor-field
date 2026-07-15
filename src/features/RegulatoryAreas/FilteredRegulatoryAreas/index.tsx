import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useEffect, useMemo, useRef } from "react";
import { RegulatoryAreasList } from "../RegulatoryAreasList";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Spacing } from "@constants/theme";
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
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ["33%", "70%", "99%"], []);
  const modalRef = useRef<BottomSheetModal>(null);
  const { selectedRegulatoryArea } = useRegulatoryAreasContext();
  const { registerRegulatoryModalHandlers } = useAppContext();

  useEffect(() => {
    return registerRegulatoryModalHandlers({
      presentList: () => modalRef.current?.present(),
      dismissList: () => modalRef.current?.dismiss(),
    });
  }, [registerRegulatoryModalHandlers]);

  const onDismiss = () => undefined;

  return (
    <BottomSheetModal
      ref={modalRef}
      snapPoints={snapPoints}
      index={selectedRegulatoryArea ? 1 : 2}
      enableDynamicSizing={false}
      enablePanDownToClose
      topInset={insets.top + Spacing.four}
      onDismiss={onDismiss}
    >
      {selectedRegulatoryArea ? (
        <RegulatoryAreaDetails
          regulatoryArea={selectedRegulatoryArea}
          onDismiss={onDismiss}
        />
      ) : (
        <>
          <Search />
          <RegulatoryAreasList onGroupFocus={onGroupFocus} />
        </>
      )}
    </BottomSheetModal>
  );
};
