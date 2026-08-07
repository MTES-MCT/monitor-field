import { useRegulatoryAreasContext } from '@contexts/RegulatoryAreasContext'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { useEffect, useMemo, useRef } from 'react'
import { RegulatoryAreasList } from '../RegulatoryAreasList'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { BoundingBox } from '@/types/mapTypes'
import { useTheme } from '@hooks/use-theme'

export const SelectedRegulatoryAreas = ({
  onFocusRegulatoryArea
}: {
  onFocusRegulatoryArea: (bbox: BoundingBox) => void
}) => {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const snapPoints = useMemo(() => ['25%', '66%', '99%'], [])
  const modalRef = useRef<BottomSheetModal>(null)

  const { setClickedFeaturesList, clickedFeaturesList, setIsolatedRegulatoryAreaId } = useRegulatoryAreasContext()

  const onDismiss = () => {
    modalRef.current?.dismiss()
    setClickedFeaturesList(undefined)
    setIsolatedRegulatoryAreaId(undefined)
  }

  useEffect(() => {
    if (clickedFeaturesList) {
      modalRef.current?.present()
    }
  }, [clickedFeaturesList])

  if (!clickedFeaturesList) return null

  return (
    <BottomSheetModal
      ref={modalRef}
      snapPoints={snapPoints}
      index={1}
      enableDynamicSizing={false}
      enablePanDownToClose
      topInset={insets.top}
      onDismiss={onDismiss}
      handleIndicatorStyle={{
        backgroundColor: theme.lightGray
      }}
    >
      <RegulatoryAreasList onClose={onDismiss} onFocusRegulatoryArea={onFocusRegulatoryArea} />
    </BottomSheetModal>
  )
}
