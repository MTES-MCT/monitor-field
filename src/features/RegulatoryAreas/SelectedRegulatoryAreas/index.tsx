import { useRegulatoryAreasContext } from "@contexts/RegulatoryAreasContext";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useEffect, useMemo, useRef } from "react";
import { RegulatoryAreasList } from "../RegulatoryAreasList";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const SelectedRegulatoryAreas = () => {
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ["25%", "66%", "99%"], []);
  const modalRef = useRef<BottomSheetModal>(null);

  const {
    setSelectedRegulatoryArea,
    setClickedFeaturesList,
    clickedFeaturesList,
  } = useRegulatoryAreasContext();

  const onDismiss = () => {
    modalRef.current?.dismiss();
    setClickedFeaturesList(undefined);
    setSelectedRegulatoryArea(undefined);
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
        areas={clickedFeaturesList}
        title={`${clickedFeaturesList.length} zones superposées sur ce point`}
        onClose={onDismiss}
      />
    </BottomSheetModal>
  );
};
