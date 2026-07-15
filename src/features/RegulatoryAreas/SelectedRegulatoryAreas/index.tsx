import {
  RegulatoryAreaListItem,
  useRegulatoryAreasContext,
} from "@contexts/RegulatoryAreasContext";
import { useAppContext } from "@contexts/AppContext";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useEffect, useMemo, useRef } from "react";
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

export const SelectedRegulatoryAreas = ({
  clickedRegulatoryAreas,
  setClickedRegulatoryAreas,
}: SelectedRegulatoryAreasProps) => {
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ["25%", "66%", "99%"], []);
  const modalRef = useRef<BottomSheetModal>(null);

  const { setSelectedRegulatoryArea, selectedRegulatoryArea } =
    useRegulatoryAreasContext();
  const { registerRegulatoryModalHandlers, openRegulatoryModalFromMapClick } =
    useAppContext();

  useEffect(() => {
    return registerRegulatoryModalHandlers({
      presentDetails: () => modalRef.current?.present(),
      dismissDetails: () => modalRef.current?.dismiss(),
    });
  }, [registerRegulatoryModalHandlers]);

  const onDismiss = () => {
    setClickedRegulatoryAreas([]);
    setSelectedRegulatoryArea(undefined);
  };

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
        <RegulatoryAreaDetails regulatoryArea={selectedRegulatoryArea} />
      ) : (
        <RegulatoryAreasList
          areas={clickedRegulatoryAreas}
          title={`${clickedRegulatoryAreas.length} zones superposées sur ce point`}
          onSelectArea={openRegulatoryModalFromMapClick}
        />
      )}
    </BottomSheetModal>
  );
};
