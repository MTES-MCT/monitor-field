import { useRegulatoryAreasContext } from '@contexts/RegulatoryAreasContext'
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { useTheme } from '@hooks/use-theme'
import { useEffect, useMemo, useRef } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { FishRegulatoryAreaDetails } from './FishRegulatoryAreaDetails'
import type { FishRegulatoryArea, EnvRegulatoryArea } from '@/types/regulatoryAreasTypes'
import { useAppContext, type ModalType } from '@contexts/AppContext'
import { useCameraContext } from '@contexts/CameraContext'
import { EnvRegulatoryAreaDetails } from './EnvRegulatoryAreaDetails'

export const RegulatoryAreaDetails = ({ origin }: { origin: ModalType }) => {
  const { activeModal, config, setActiveModal } = useAppContext()
  const {
    selectedRegulatoryArea,
    setSelectedRegulatoryArea,
    committedSearchBbox,
    committedSearchZoom,
    setCommittedSearchBbox
  } = useRegulatoryAreasContext()
  const { zoomToBbox } = useCameraContext()
  const theme = useTheme()

  const insets = useSafeAreaInsets()
  const snapPoints = useMemo(() => ['25%', '66%', '99%'], [])
  const modalRef = useRef<BottomSheetModal>(null)

  const colorKey = selectedRegulatoryArea?.fillColor as keyof typeof theme
  const color = theme[colorKey] ?? theme.white

  const onDismiss = () => {
    modalRef.current?.dismiss()
    setActiveModal(origin)
    setSelectedRegulatoryArea(undefined)
    if (committedSearchBbox) {
      const centerLat = (committedSearchBbox.minLat + committedSearchBbox.maxLat) / 2
      const centerLon = (committedSearchBbox.minLon + committedSearchBbox.maxLon) / 2
      zoomToBbox({ centerLat, centerLon, zoom: committedSearchZoom })
      setCommittedSearchBbox(committedSearchBbox)
    }
  }

  useEffect(() => {
    if (activeModal === 'REGULATORY_AREA_DETAILS_MODAL') {
      modalRef.current?.present()
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
