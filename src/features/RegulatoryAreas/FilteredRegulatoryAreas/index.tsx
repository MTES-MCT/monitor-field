import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { useEffect, useMemo, useRef } from 'react'
import type { RegulatoryAreaListItem } from '@contexts/RegulatoryAreasContext'
import { RegulatoryAreasList } from '../RegulatoryAreasList'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@hooks/use-theme'
import { SearchInput } from '../Search/SearchInput'
import { useAppContext, type ModalType } from '@contexts/AppContext'

type FilteredRegulatoryAreasProps = {
  focusAndSetOrgin: (area: RegulatoryAreaListItem, activeModal: ModalType) => void
  isLoading: boolean
  onSearchFocus: () => void
}

export const FilteredRegulatoryAreas = ({
  focusAndSetOrgin,
  isLoading,
  onSearchFocus
}: FilteredRegulatoryAreasProps) => {
  const theme = useTheme()
  const { activeModal, setActiveModal } = useAppContext()

  const insets = useSafeAreaInsets()
  const snapPoints = useMemo(() => ['25%', '66%', '99%'], [])
  const modalRef = useRef<BottomSheetModal>(null)

  const onDismiss = () => {
    setActiveModal(undefined)
    modalRef.current?.dismiss()
  }

  useEffect(() => {
    if (activeModal === 'REGULATORY_AREAS_LIST_MODAL') {
      modalRef.current?.present()
    }
  }, [activeModal])

  if (activeModal !== 'REGULATORY_AREAS_LIST_MODAL') {
    return null
  }

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
      <SearchInput onClose={onDismiss} onSearchFocus={onSearchFocus} />
      <RegulatoryAreasList focusAndSetOrgin={focusAndSetOrgin} onClose={onDismiss} isLoading={isLoading} />
    </BottomSheetModal>
  )
}
