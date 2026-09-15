import { useRegulatoryAreasContext } from '@contexts/RegulatoryAreasContext'
import { BottomSheetFlatList, BottomSheetModal } from '@gorhom/bottom-sheet'
import { useEffect, useMemo, useRef } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@hooks/use-theme'
import { useAppContext, type ModalType } from '@contexts/AppContext'
import { Spacing } from '@constants/theme'
import { ThemedText } from '@components/Elements/Text'
import { StyleSheet, View } from 'react-native'
import { useRegulatoryAreasList } from '../hooks/useRegulatoryAreasList'

export const SelectedRegulatoryAreas = ({
  setRegulatoryAreaDetailsOrigin
}: {
  setRegulatoryAreaDetailsOrigin: (origin: ModalType) => void
}) => {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const snapPoints = useMemo(() => ['25%', '66%', '99%'], [])
  const modalRef = useRef<BottomSheetModal>(null)

  const { activeModal, setActiveModal } = useAppContext()
  const { setClickedFeaturesList, setIsolatedRegulatoryAreaId, filters } = useRegulatoryAreasContext()

  const onClose = () => {
    modalRef.current?.dismiss()
    setClickedFeaturesList(undefined)
    setIsolatedRegulatoryAreaId(undefined)
    setActiveModal(undefined)
  }

  const { flattenedRows, expandedGroups, renderRow, renderHeader, areResultsVisible } = useRegulatoryAreasList({
    onClose,
    onSelectRegulatoryArea: () => setRegulatoryAreaDetailsOrigin('CLICKED_FEATURES_LIST_MODAL'),
    origin: 'CLICKED_FEATURES_LIST_MODAL'
  })
  useEffect(() => {
    if (activeModal === 'CLICKED_FEATURES_LIST_MODAL') {
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
      topInset={insets.top}
      handleStyle={{
        backgroundColor: theme.white,
        borderRadius: 0
      }}
      handleIndicatorStyle={{
        backgroundColor: theme.lightGray
      }}
      stackBehavior="replace"
    >
      <BottomSheetFlatList
        style={{ marginBottom: Spacing.six }}
        data={areResultsVisible ? flattenedRows : []}
        extraData={expandedGroups}
        keyExtractor={item => (item.type === 'group' ? `group-${item.group}` : `area-${item.group}-${item.area.id}`)}
        renderItem={renderRow}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          filters.searchQuery?.trim() ? (
            <ThemedText type="small" themeColor="textSecondary" style={styles.emptyState}>
              Aucune zone réglementaire ne correspond à cette recherche.
            </ThemedText>
          ) : null
        }
        ItemSeparatorComponent={() => (
          <View
            style={{
              backgroundColor: theme.lightGray,
              height: 1
            }}
          />
        )}
      />
    </BottomSheetModal>
  )
}

const styles = StyleSheet.create({
  emptyState: {
    paddingHorizontal: Spacing.four
  },
  listContent: {
    paddingBottom: Spacing.four
  }
})
