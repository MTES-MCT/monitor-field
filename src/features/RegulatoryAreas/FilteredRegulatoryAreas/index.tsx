import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useEffect, useMemo, useRef } from "react";
import { RegulatoryAreasList } from "../RegulatoryAreasList";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Spacing } from "@constants/theme";
import { BoundingBox } from "@/types/MapTypes";
import { useRegulatoryAreasContext } from "@contexts/RegulatoryAreasContext";
import { RegulatoryAreaDetails } from "../SelectedRegulatoryAreas/RegulatoryAreaDetails";

type FilteredRegulatoryAreasProps = {
  onDismiss?: () => void;
  onGroupFocus?: (bbox: BoundingBox) => void;
};

export const FilteredRegulatoryAreas = ({
  onDismiss,
  onGroupFocus,
}: FilteredRegulatoryAreasProps) => {
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ["33%", "70%", "90%"], []);
  const modalRef = useRef<BottomSheetModal>(null);
  const { registerRegulatoryModalHandlers, selectedRegulatoryArea } =
    useRegulatoryAreasContext();

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
      index={1}
      enableDynamicSizing={false}
      enablePanDownToClose
      topInset={insets.top + Spacing.four}
      onDismiss={onDismiss}
    >
      {selectedRegulatoryArea ? (
        <RegulatoryAreaDetails
          regulatoryArea={selectedRegulatoryArea}
          onDismiss={() => modalRef.current?.dismiss()}
        />
      ) : (
        <RegulatoryAreasList onGroupFocus={onGroupFocus} />
      )}
    </BottomSheetModal>
  );
};
