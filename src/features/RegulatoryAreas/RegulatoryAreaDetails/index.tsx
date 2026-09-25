import { useRegulatoryAreasContext } from '@contexts/RegulatoryAreasContext'
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { useTheme } from '@hooks/use-theme'
import { useEffect, useMemo, useRef } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { FishRegulatoryAreaDetails } from './FishRegulatoryAreaDetails'
import type {
  FishRegulatoryAreaSummary,
  EnvRegulatoryAreaSummary
} from '@domain/entities/regulatoryAreas/RegulatoryAreaSummary'
import { useAppContext, type ModalType } from '@contexts/AppContext'
import { EnvRegulatoryAreaDetails } from './EnvRegulatoryAreaDetails'

export const RegulatoryAreaDetails = ({ origin }: { origin: ModalType }) => {
  const { activeModal, config, setActiveModal } = useAppContext()
  const { selectedRegulatoryArea, setSelectedRegulatoryArea } = useRegulatoryAreasContext()
  const theme = useTheme()

  const insets = useSafeAreaInsets()
  const snapPoints = useMemo(() => ['25%', '66%', '99%'], [])
  const modalRef = useRef<BottomSheetModal>(null)

  const colorKey = selectedRegulatoryArea?.colorKey as keyof typeof theme
  const color = theme[colorKey] ?? theme.white

  const onClose = () => {
    modalRef.current?.dismiss()
  }

  const onDismiss = () => {
    setSelectedRegulatoryArea(undefined)
    setActiveModal(origin)
  }

  useEffect(() => {
    if (activeModal === 'REGULATORY_AREA_DETAILS_MODAL') {
      modalRef.current?.present()
    } else {
      modalRef.current?.dismiss()
    }
  }, [activeModal])

  return (
    <BottomSheetModal
      ref={modalRef}
      snapPoints={snapPoints}
      index={1}
      enableDynamicSizing={false}
      enablePanDownToClose={false}
      topInset={insets?.top}
      handleStyle={{
        backgroundColor: theme.white,
        borderRadius: 0
      }}
      handleIndicatorStyle={{
        backgroundColor: theme.lightGray
      }}
      stackBehavior="replace"
      onDismiss={onDismiss}
    >
      <BottomSheetScrollView>
        {selectedRegulatoryArea && config.mode === 'MONITORFISH' && (
          <FishRegulatoryAreaDetails
            color={color}
            regulatoryArea={selectedRegulatoryArea as FishRegulatoryAreaSummary}
            onDismiss={onClose}
          />
        )}
        {selectedRegulatoryArea && config.mode === 'MONITORENV' && (
          <EnvRegulatoryAreaDetails
            color={color}
            regulatoryArea={selectedRegulatoryArea as EnvRegulatoryAreaSummary}
            onDismiss={onClose}
          />
        )}
      </BottomSheetScrollView>
    </BottomSheetModal>
  )
}
