import { useRegulatoryAreasContext } from '@contexts/RegulatoryAreasContext'
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { useTheme } from '@hooks/use-theme'
import { useMemo, useRef, useEffect, useCallback } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { FishRegulatoryAreaDetails } from './FishRegulatoryAreaDetails'
import type {
  FishRegulatoryAreaSummary,
  EnvRegulatoryAreaSummary
} from '@domain/entities/regulatoryAreas/RegulatoryAreaSummary'
import { useAppContext } from '@contexts/AppContext'
import { EnvRegulatoryAreaDetails } from './EnvRegulatoryAreaDetails'
import { useBackHandler } from '@hooks/useBackHandler'

export const animationConfigs = {
  overshootClamping: true,
  restDisplacementThreshold: 0.5,
  restSpeedThreshold: 0.5
}

const ORIGIN = 'REGULATORY_AREA_DETAILS_MODAL'

export const RegulatoryAreaDetails = () => {
  const { activeModal, config, setActiveModal } = useAppContext()
  const { selectedRegulatoryArea, setSelectedRegulatoryArea, regulatoryAreaDetailsOrigin } = useRegulatoryAreasContext()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const snapPoints = useMemo(() => ['25%', '66%', '99%'], [])
  const modalRef = useRef<BottomSheet>(null)

  const colorKey = selectedRegulatoryArea?.colorKey as keyof typeof theme
  const color = theme[colorKey] ?? theme.white

  const onClose = useCallback(() => {
    setActiveModal(regulatoryAreaDetailsOrigin)
    setSelectedRegulatoryArea(undefined)
  }, [setActiveModal, setSelectedRegulatoryArea, regulatoryAreaDetailsOrigin])

  useBackHandler(onClose, activeModal === ORIGIN)

  const modalStyle = useMemo(
    () => ({
      backgroundColor: theme.white,
      borderRadius: 0
    }),
    [theme.white]
  )

  const indicatorStyle = useMemo(
    () => ({
      backgroundColor: theme.lightGray
    }),
    [theme.lightGray]
  )

  useEffect(() => {
    if (activeModal === ORIGIN) {
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
      handleStyle={modalStyle}
      handleIndicatorStyle={indicatorStyle}
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
