import { useRegulatoryAreasContext } from '@contexts/RegulatoryAreasContext'
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@hooks/use-theme'
import { useAppContext, type ModalType } from '@contexts/AppContext'
import { useCameraContext } from '@contexts/CameraContext'
import { Spacing } from '@constants/theme'
import { ThemedText } from '@components/Elements/Text'
import { StyleSheet } from 'react-native'
import { useRegulatoryAreasList } from '../hooks/useRegulatoryAreasList'
import { animationConfigs } from '../RegulatoryAreaDetails'
import { useBackHandler } from '@hooks/useBackHandler'

const ORIGIN = 'CLICKED_FEATURES_LIST_MODAL'

export const SelectedRegulatoryAreas = ({
  setRegulatoryAreaDetailsOrigin
}: {
  setRegulatoryAreaDetailsOrigin: (origin: ModalType) => void
}) => {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const snapPoints = useMemo(() => ['25%', '66%'], [])
  const modalRef = useRef<BottomSheet>(null)

  const { config, activeModal, setActiveModal } = useAppContext()
  const { setClickedFeaturesList, setIsolatedRegulatoryAreaId, filters } = useRegulatoryAreasContext()
  const { setClickedCoordinate } = useCameraContext()

  const searchQuery = useMemo(() => {
    return config.mode === 'MONITORENV'
      ? (filters.searchQueryEnv?.trim() ?? undefined)
      : (filters.searchQueryFish?.trim() ?? undefined)
  }, [config.mode, filters.searchQueryEnv, filters.searchQueryFish])

  const onClose = useCallback(() => {
    setClickedFeaturesList(undefined)
    setClickedCoordinate(undefined)
    setActiveModal(undefined)
    setIsolatedRegulatoryAreaId(undefined)
  }, [setActiveModal, setClickedFeaturesList, setClickedCoordinate, setIsolatedRegulatoryAreaId])

  const { flattenedRows, expandedGroups, renderRow, renderHeader, areResultsVisible } = useRegulatoryAreasList({
    onClose,
    onSelectRegulatoryArea: () => setRegulatoryAreaDetailsOrigin(ORIGIN),
    origin: ORIGIN,
    skip: activeModal !== ORIGIN
  })

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

  useBackHandler(onClose, activeModal === ORIGIN)
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
      animationConfigs={animationConfigs}
      enableDynamicSizing={false}
      enablePanDownToClose={false}
      topInset={insets.top}
      handleStyle={modalStyle}
      handleIndicatorStyle={indicatorStyle}
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
      />
    </BottomSheet>
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
