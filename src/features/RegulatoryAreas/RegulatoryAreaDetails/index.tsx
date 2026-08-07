import { useRegulatoryAreasContext } from '@contexts/RegulatoryAreasContext'
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { useTheme } from '@hooks/use-theme'
import { useEffect, useMemo, useRef } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { FishRegulatoryAreaDetails } from './FishRegulatoryAreaDetails'
import type { FishRegulatoryArea, EnvRegulatoryArea } from '@/types/regulatoryAreasTypes'
import { useAppContext } from '@contexts/AppContext'
import { EnvRegulatoryAreaDetails } from './EnvRegulatoryAreaDetails'

export const RegulatoryAreaDetails = () => {
  const { selectedRegulatoryArea, setSelectedRegulatoryArea } = useRegulatoryAreasContext()
  const theme = useTheme()
  const { config } = useAppContext()

  const insets = useSafeAreaInsets()
  const snapPoints = useMemo(() => ['25%', '66%', '99%'], [])
  const modalRef = useRef<BottomSheetModal>(null)

  const colorKey = selectedRegulatoryArea?.fillColor as keyof typeof theme
  const color = theme[colorKey] ?? theme.white

  const onDismiss = () => {
    modalRef.current?.dismiss()
    setSelectedRegulatoryArea(undefined)
  }

  useEffect(() => {
    if (selectedRegulatoryArea) {
      modalRef.current?.present()
    }
  }, [selectedRegulatoryArea])

  if (!selectedRegulatoryArea) {
    return null
  }

  return (
    <BottomSheetModal
      ref={modalRef}
      snapPoints={snapPoints}
      index={1}
      enableDynamicSizing={false}
      enablePanDownToClose
      topInset={insets?.top}
      onDismiss={onDismiss}
      handleIndicatorStyle={{
        backgroundColor: theme.lightGray
      }}
    >
      <BottomSheetScrollView>
        {config.mode === 'MONITORFISH' && (
          <FishRegulatoryAreaDetails
            color={color}
            regulatoryArea={selectedRegulatoryArea as FishRegulatoryArea}
            onDismiss={onDismiss}
          />
        )}
        {config.mode === 'MONITORENV' && (
          <EnvRegulatoryAreaDetails
            color={color}
            regulatoryArea={selectedRegulatoryArea as EnvRegulatoryArea}
            onDismiss={onDismiss}
          />
        )}
      </BottomSheetScrollView>
    </BottomSheetModal>
  )
}
