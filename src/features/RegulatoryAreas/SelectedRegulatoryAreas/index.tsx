import { useRegulatoryAreasContext } from "@contexts/RegulatoryAreasContext";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useEffect, useMemo, useRef } from "react";
import { RegulatoryAreasList } from "../RegulatoryAreasList";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BoundingBox } from "@/types/mapTypes";

export const SelectedRegulatoryAreas = ({
  onFocusGroupOrRegulatoryArea,
}: {
  onFocusGroupOrRegulatoryArea: (bbox: BoundingBox) => void;
}) => {
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ["25%", "66%", "99%"], []);
  const modalRef = useRef<BottomSheetModal>(null);

  const {
    setClickedFeaturesList,
    clickedFeaturesList,
    setIsolatedRegulatoryArea,
  } = useRegulatoryAreasContext();

  const onDismiss = () => {
    modalRef.current?.dismiss();
    setClickedFeaturesList(undefined);
    setIsolatedRegulatoryArea(undefined);
  };

  useEffect(() => {
    if (clickedFeaturesList) {
      modalRef.current?.present();
    }
  }, [clickedFeaturesList]);

  if (!clickedFeaturesList) return null;

  return (
    <BottomSheetModal
      ref={modalRef}
      snapPoints={snapPoints}
      index={1}
      enableDynamicSizing={false}
      enablePanDownToClose
      topInset={insets.top}
      onDismiss={onDismiss}
    >
      <RegulatoryAreasList
        onClose={onDismiss}
        onFocusGroupOrRegulatoryArea={onFocusGroupOrRegulatoryArea}
      />
    </BottomSheetModal>
  );
};
