import { useAppContext, type ModalType } from '@contexts/AppContext'
import { SearchInput } from './SearchInput'
import { RegulatoryAreasList } from '../RegulatoryAreasList'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { useEffect, useRef } from 'react'
import { Spacing } from '@constants/theme'
import type { RegulatoryAreaListItem } from '@contexts/RegulatoryAreasContext'

type SearchPageProps = {
  focusAndSetOrgin: (area: RegulatoryAreaListItem, activeModal: ModalType) => void
  origin: ModalType
  resetOrigin: () => void
  isLoading: boolean
}

export function SearchPage({ focusAndSetOrgin, origin, resetOrigin, isLoading }: SearchPageProps) {
  const modalRef = useRef<BottomSheetModal>(null)

  const { activeModal, setActiveModal } = useAppContext()

  const onDismiss = () => {
    setActiveModal(undefined)
    resetOrigin()
    modalRef.current?.dismiss()
  }

  const shouldShowResults = origin === 'REGULATORY_AREAS_LIST_MODAL'

  useEffect(() => {
    if (activeModal === 'SEARCH_BY_QUERY_MODAL') {
      modalRef.current?.present()
    }
  }, [activeModal])

  if (activeModal && activeModal !== 'SEARCH_BY_QUERY_MODAL') return null

  return (
    <BottomSheetModal
      ref={modalRef}
      snapPoints={['100%']}
      index={0}
      enableDynamicSizing={false}
      enablePanDownToClose={false}
      enableContentPanningGesture={false}
      handleStyle={{
        backgroundColor: 'white',
        borderRadius: 0,
        paddingTop: Spacing.four
      }}
      handleIndicatorStyle={{
        backgroundColor: 'white'
      }}
    >
      <SearchInput onClose={onDismiss} />
      <RegulatoryAreasList
        focusAndSetOrgin={focusAndSetOrgin}
        onClose={onDismiss}
        isLoading={isLoading}
        shouldShowResults={shouldShowResults}
      />
    </BottomSheetModal>
  )
}
