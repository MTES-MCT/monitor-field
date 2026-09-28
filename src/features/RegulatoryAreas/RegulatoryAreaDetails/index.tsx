import { useRegulatoryAreasContext } from '@contexts/RegulatoryAreasContext'
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { useTheme } from '@hooks/use-theme'
import { useMemo, useRef, useEffect } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { FishRegulatoryAreaDetails } from './FishRegulatoryAreaDetails'
import type {
  FishRegulatoryAreaSummary,
  EnvRegulatoryAreaSummary
} from '@domain/entities/regulatoryAreas/RegulatoryAreaSummary'
import { useAppContext } from '@contexts/AppContext'
import { EnvRegulatoryAreaDetails } from './EnvRegulatoryAreaDetails'

export const animationConfigs = {
  damping: 150,
  overshootClamping: true,
  restDisplacementThreshold: 0.1,
  restSpeedThreshold: 0.1,
  stiffness: 500
}

export const RegulatoryAreaDetails = () => {
  const { activeModal, config, setActiveModal } = useAppContext()
  const { selectedRegulatoryArea, setSelectedRegulatoryArea, regulatoryAreaDetailsOrigin } = useRegulatoryAreasContext()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const snapPoints = useMemo(() => ['25%', '66%', '99%'], [])
  const modalRef = useRef<BottomSheet>(null)

  const colorKey = selectedRegulatoryArea?.colorKey as keyof typeof theme
  const color = theme[colorKey] ?? theme.white

  const onClose = () => {
    setActiveModal(regulatoryAreaDetailsOrigin)
    setSelectedRegulatoryArea(undefined)
  }

  useEffect(() => {
    if (activeModal === 'REGULATORY_AREA_DETAILS_MODAL') {
      modalRef.current?.snapToIndex(1)
    } else {
      modalRef.current?.close()
    }
  }, [activeModal])

  return (
    <BottomSheet
      ref={modalRef}
      snapPoints={snapPoints}
      index={-1}
      enableDynamicSizing={false}
      enablePanDownToClose={false}
      topInset={insets?.top}
      animationConfigs={animationConfigs}
      handleStyle={{
        backgroundColor: theme.white,
        borderRadius: 0
      }}
      handleIndicatorStyle={{
        backgroundColor: theme.lightGray
      }}
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
    </BottomSheet>
  )
}
