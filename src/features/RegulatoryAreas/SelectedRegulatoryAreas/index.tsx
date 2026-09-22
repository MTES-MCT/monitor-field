import { useRegulatoryAreasContext } from '@contexts/RegulatoryAreasContext'
import { BottomSheetFlatList, BottomSheetModal } from '@gorhom/bottom-sheet'
import { useEffect, useMemo, useRef } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@hooks/use-theme'
import { useAppContext, type ModalType } from '@contexts/AppContext'
import { useCameraContext } from '@contexts/CameraContext'
import { Spacing } from '@constants/theme'
import { ThemedText } from '@components/Elements/Text'
import { StyleSheet, View } from 'react-native'
import { useRegulatoryAreasList } from '../hooks/useRegulatoryAreasList'

const ORIGIN = 'CLICKED_FEATURES_LIST_MODAL'

export const SelectedRegulatoryAreas = ({
  setRegulatoryAreaDetailsOrigin
}: {
  setRegulatoryAreaDetailsOrigin: (origin: ModalType) => void
}) => {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const snapPoints = useMemo(() => ['25%', '66%'], [])
  const modalRef = useRef<BottomSheetModal>(null)
  const hasPresentedRef = useRef(false)

  const { config, activeModal, setActiveModal } = useAppContext()
  const { setClickedFeaturesList, setIsolatedRegulatoryAreaId, filters } = useRegulatoryAreasContext()
  const { setClickedCoordinate } = useCameraContext()

  const searchQuery = useMemo(() => {
    return config.mode === 'MONITORENV'
      ? (filters.searchQueryEnv?.trim() ?? undefined)
      : (filters.searchQueryFish?.trim() ?? undefined)
  }, [config.mode, filters.searchQueryEnv, filters.searchQueryFish])

  const onClose = () => {
    setActiveModal(undefined)
    setClickedFeaturesList(undefined)
    setIsolatedRegulatoryAreaId(undefined)
    setClickedCoordinate(undefined)
    modalRef.current?.dismiss()
  }

  const { flattenedRows, expandedGroups, renderRow, renderHeader, areResultsVisible } = useRegulatoryAreasList({
    onClose,
    onSelectRegulatoryArea: () => setRegulatoryAreaDetailsOrigin(ORIGIN),
    origin: ORIGIN
  })

  useEffect(() => {
    if (activeModal === 'CLICKED_FEATURES_LIST_MODAL') {
      hasPresentedRef.current = true
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
          searchQuery?.trim() ? (
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
