import {
  RegulatoryAreaListItem,
  useRegulatoryAreasContext,
} from "@contexts/RegulatoryAreasContext";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { forwardRef, useMemo } from "react";
import { RegulatoryAreaDetails } from "./RegulatoryAreaDetails";
import { RegulatoryAreasList } from "../RegulatoryAreasList";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Spacing } from "@constants/theme";

type SelectedRegulatoryAreasProps = {
  clickedRegulatoryAreas: RegulatoryAreaListItem[];
  setClickedRegulatoryAreas: (
    clickedRegulatoryAreas: RegulatoryAreaListItem[],
  ) => void;
};
export const SelectedRegulatoryAreas = forwardRef<
  BottomSheetModal,
  SelectedRegulatoryAreasProps
>(({ clickedRegulatoryAreas, setClickedRegulatoryAreas }, ref) => {
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ["25%", "50%", "95%"], []);

  const { setSelectedRegulatoryArea, selectedRegulatoryArea } =
    useRegulatoryAreasContext();

  const handleDetailsDismiss = () => {
    setSelectedRegulatoryArea(undefined);
  };

  const handleSelectionDismiss = () => {
    setClickedRegulatoryAreas([]);
    setSelectedRegulatoryArea(undefined);
  };

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      index={1}
      enableDynamicSizing={false}
      enablePanDownToClose
      topInset={insets.top + Spacing.four}
      onDismiss={handleSelectionDismiss}
    >
      {selectedRegulatoryArea ? (
        <RegulatoryAreaDetails
          regulatoryArea={selectedRegulatoryArea}
          onDismiss={handleDetailsDismiss}
        />
      ) : (
        <RegulatoryAreasList
          areas={clickedRegulatoryAreas}
          title={`${clickedRegulatoryAreas.length} zones superposees sur ce point`}
        />
      )}
    </BottomSheetModal>
  );
});

SelectedRegulatoryAreas.displayName = "SelectedRegulatoryAreas";
