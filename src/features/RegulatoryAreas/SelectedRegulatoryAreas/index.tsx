import { useRegulatoryAreasContext } from '@contexts/RegulatoryAreasContext'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { useEffect, useMemo, useRef } from 'react'
import { RegulatoryAreasList } from '../RegulatoryAreasList'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { RegulatoryAreaListItem } from '@contexts/RegulatoryAreasContext'
import { useTheme } from '@hooks/use-theme'
import { useAppContext, type ModalType } from '@contexts/AppContext'

export const SelectedRegulatoryAreas = ({
  focusAndSetOrgin,
  isLoading
}: {
  focusAndSetOrgin: (area: RegulatoryAreaListItem, activeModal: ModalType) => void
  isLoading: boolean
}) => {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const snapPoints = useMemo(() => ['25%', '66%', '99%'], [])
  const modalRef = useRef<BottomSheetModal>(null)

  const { activeModal, setActiveModal } = useAppContext()

  const { setClickedFeaturesList, setIsolatedRegulatoryAreaId } = useRegulatoryAreasContext()

  const onDismiss = () => {
    modalRef.current?.dismiss()
    setClickedFeaturesList(undefined)
    setIsolatedRegulatoryAreaId(undefined)
    setActiveModal(undefined)
  }

  useEffect(() => {
    if (activeModal === 'CLICKED_FEATURES_LIST_MODAL') {
      modalRef.current?.present()
    }
  }, [activeModal])

  if (activeModal !== 'CLICKED_FEATURES_LIST_MODAL') return null

  return (
    <BottomSheetModal
      ref={modalRef}
      snapPoints={snapPoints}
      index={1}
      enableDynamicSizing={false}
      enablePanDownToClose={false}
      topInset={insets.top}
      handleStyle={{
        backgroundColor: theme.white,
        borderRadius: 0
      }}
      handleIndicatorStyle={{
        backgroundColor: theme.lightGray
      }}
    >
      <RegulatoryAreasList onClose={onDismiss} focusAndSetOrgin={focusAndSetOrgin} isLoading={isLoading} />
    </BottomSheetModal>
  )
}
