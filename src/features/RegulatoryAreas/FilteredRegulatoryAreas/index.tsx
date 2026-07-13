import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { forwardRef, useMemo } from "react";
import { RegulatoryAreasList } from "../RegulatoryAreasList";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Spacing } from "@constants/theme";
import { BoundingBox } from "@/types/MapTypes";

type FilteredRegulatoryAreasProps = {
  onDismiss?: () => void;
  onGroupFocus?: (bbox: BoundingBox) => void;
};

export const FilteredRegulatoryAreas = forwardRef<
  BottomSheetModal,
  FilteredRegulatoryAreasProps
>(({ onDismiss, onGroupFocus }, ref) => {
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ["33%", "70%", "90%"], []);
  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      index={1}
      enableDynamicSizing={false}
      enablePanDownToClose
      topInset={insets.top + Spacing.four}
      onDismiss={onDismiss}
    >
      <RegulatoryAreasList onGroupFocus={onGroupFocus} />
    </BottomSheetModal>
  );
});

FilteredRegulatoryAreas.displayName = "FilteredRegulatoryAreas";
