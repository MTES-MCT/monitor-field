import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useEffect, useMemo, useRef } from "react";
import { RegulatoryAreasList } from "../RegulatoryAreasList";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BoundingBox } from "@/types/mapTypes";
import { useRegulatoryAreasContext } from "@contexts/RegulatoryAreasContext";
import { Search } from "./Search";

type FilteredRegulatoryAreasProps = {
  onFocusGroupOrRegulatoryArea: (bbox: BoundingBox) => void;
};

export const FilteredRegulatoryAreas = ({
  onFocusGroupOrRegulatoryArea,
}: FilteredRegulatoryAreasProps) => {
  const {
    setIsSearchByQueryActive,
    isSearchByQueryActive,
    setClickedFeaturesList,
    isListVisible,
    setIsListVisible,
  } = useRegulatoryAreasContext();

  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ["25%", "66%", "99%"], []);
  const modalRef = useRef<BottomSheetModal>(null);
  useEffect(() => {}, [isSearchByQueryActive]);

  const onDismiss = () => {
    setIsSearchByQueryActive(false);
    setClickedFeaturesList(undefined);
    setIsListVisible(false);
    modalRef.current?.dismiss();
  };

  useEffect(() => {
    if (isSearchByQueryActive || isListVisible) {
      modalRef.current?.present();
    }
  }, [isSearchByQueryActive, isListVisible]);

  if (!isListVisible && !isSearchByQueryActive) {
    return null;
  }

  return (
    <BottomSheetModal
      ref={modalRef}
      snapPoints={snapPoints}
      index={isSearchByQueryActive ? 2 : 1}
      enableDynamicSizing={false}
      enablePanDownToClose
      topInset={insets.top}
      onDismiss={onDismiss}
    >
      <>
        <Search onClose={onDismiss} />
        <RegulatoryAreasList
          onFocusGroupOrRegulatoryArea={onFocusGroupOrRegulatoryArea}
          onClose={onDismiss}
        />
      </>
    </BottomSheetModal>
  );
};
