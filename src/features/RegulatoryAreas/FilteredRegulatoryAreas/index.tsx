import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useRegulatoryAreasContext } from '@contexts/RegulatoryAreasContext'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@hooks/use-theme'
import { useAppContext, type ModalType } from '@contexts/AppContext'
import { StyleSheet, TextInput, View } from 'react-native'
import { Spacing } from '@constants/theme'
import { useRouter } from 'expo-router'
import { EnvFilters } from './EnvFilters'
import { ThemedText } from '@components/Elements/Text'
import { useRegulatoryAreasList } from '../hooks/useRegulatoryAreasList'
import { useGlobalStyle } from '@globalStyle'
import { animationConfigs } from '../RegulatoryAreaDetails'
import { useBackHandler } from '@hooks/useBackHandler'
import { SearchInput } from '@components/SearchInput'

type FilteredRegulatoryAreasProps = {
  openRegulatoryAreaDetails: (origin: ModalType | undefined) => void
}

const ORIGIN = 'REGULATORY_AREAS_LIST_MODAL'

export const FilteredRegulatoryAreas = ({ openRegulatoryAreaDetails }: FilteredRegulatoryAreasProps) => {
  const inputRef = useRef<TextInput | null>(null)
  const theme = useTheme()
  const globalStyle = useGlobalStyle()
  const router = useRouter()
  const { activeModal, config, setActiveModal } = useAppContext()
  const { filters, setFilters } = useRegulatoryAreasContext()

  const insets = useSafeAreaInsets()
  const snapPoints = useMemo(() => ['25%', '66%', '99%'], [])
  const modalRef = useRef<BottomSheet>(null)

  const searchQuery = useMemo(() => {
    return config.mode === 'MONITORENV'
      ? (filters.searchQueryEnv?.trim() ?? undefined)
      : (filters.searchQueryFish?.trim() ?? undefined)
  }, [config.mode, filters.searchQueryEnv, filters.searchQueryFish])

  const closeModal = useCallback(() => {
    setActiveModal(undefined)
  }, [setActiveModal])

  useBackHandler(closeModal, activeModal === ORIGIN)

  const { flattenedRows, expandedGroup, renderRow, renderHeader, areResultsVisible } = useRegulatoryAreasList({
    onSelectRegulatoryArea: () => openRegulatoryAreaDetails(ORIGIN),
    origin: ORIGIN,
    shouldShowResults: true
  })

  const clearText = useCallback(() => {
    setFilters(currentFilters => ({
      ...currentFilters,
      ...(config.mode === 'MONITORENV' ? { searchQueryEnv: undefined } : { searchQueryFish: undefined })
    }))
  }, [config.mode, setFilters])

  const focusSearchInput = useCallback(() => {
    if (activeModal === ORIGIN) {
      router.push(`/search?origin=${ORIGIN}`)
      setActiveModal(undefined)
    }
  }, [setActiveModal, router, activeModal])

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
      animationConfigs={animationConfigs}
      enableDynamicSizing={false}
      enablePanDownToClose={false}
      topInset={insets.top}
      handleStyle={modalStyle}
      handleIndicatorStyle={indicatorStyle}
    >
      <View style={styles.filtersWrapper}>
        <SearchInput
          ref={inputRef}
          searchText={searchQuery ?? ''}
          onClearText={clearText}
          onFocus={focusSearchInput}
          onClose={closeModal}
        />
        {config?.features?.hasRegulatoryAreasFilters && <EnvFilters />}
      </View>
      <View style={globalStyle.separator} />
      <BottomSheetFlatList
        style={{ marginBottom: Spacing.six }}
        data={areResultsVisible ? flattenedRows : []}
        extraData={expandedGroup}
        keyExtractor={item => (item.type === 'group' ? `group-${item.group}` : `area-${item.group}-${item.area.id}`)}
        renderItem={renderRow}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          searchQuery?.trim() ? (
            <ThemedText type="defaultItalic" themeColor="textSecondary" style={styles.emptyState}>
              Aucune réglementation ne correspond à cette recherche dans la zone affichée à l’écran.
            </ThemedText>
          ) : null
        }
      />
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  emptyState: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    textAlign: 'center'
  },
  filtersWrapper: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.one,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.one // Added top padding for the filters dot
  },
  listContent: {
    paddingBottom: Spacing.four
  }
})
