import { BottomSheetFlatList, BottomSheetModal } from '@gorhom/bottom-sheet'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useRegulatoryAreasContext } from '@contexts/RegulatoryAreasContext'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@hooks/use-theme'
import { useAppContext, type ModalType } from '@contexts/AppContext'
import { StyleSheet, TextInput, View } from 'react-native'
import { Spacing } from '@constants/theme'
import { BackButton } from '@components/Buttons/BackButton'
import { useRouter } from 'expo-router'
import { EnvFilters } from './EnvFilters'
import { ThemedText } from '@components/Elements/Text'
import { useRegulatoryAreasList } from '../hooks/useRegulatoryAreasList'
import { useGlobalStyle } from '@globalStyle'

type FilteredRegulatoryAreasProps = {
  setRegulatoryAreaDetailsOrigin: (origin: ModalType | undefined) => void
}

export const FilteredRegulatoryAreas = ({ setRegulatoryAreaDetailsOrigin }: FilteredRegulatoryAreasProps) => {
  const theme = useTheme()
  const styles = createStyles(theme)
  const globalStyle = useGlobalStyle()
  const router = useRouter()
  const { activeModal, config, setActiveModal } = useAppContext()
  const { filters } = useRegulatoryAreasContext()

  const insets = useSafeAreaInsets()
  const snapPoints = useMemo(() => ['25%', '66%', '99%'], [])
  const modalRef = useRef<BottomSheetModal>(null)

  const onClose = useCallback(() => {
    setRegulatoryAreaDetailsOrigin('REGULATORY_AREAS_LIST_MODAL')
    setActiveModal(undefined)
    modalRef.current?.dismiss()
  }, [setActiveModal, setRegulatoryAreaDetailsOrigin])

  const { flattenedRows, expandedGroups, renderRow, renderHeader, areResultsVisible } = useRegulatoryAreasList({
    onClose,
    onSelectRegulatoryArea: () => setRegulatoryAreaDetailsOrigin('REGULATORY_AREAS_LIST_MODAL'),
    origin: 'REGULATORY_AREAS_LIST_MODAL',
    shouldShowResults: true
  })

  useEffect(() => {
    if (activeModal === 'REGULATORY_AREAS_LIST_MODAL') {
      modalRef.current?.present()
    } else if (activeModal === undefined) {
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
      style={{ paddingBottom: 100 }}
    >
      <View style={{ flexDirection: 'row', paddingHorizontal: Spacing.three }}>
        <View style={styles.searchBox}>
          <BackButton onBack={onClose} style={{ marginLeft: Spacing.two }} />

          <TextInput
            style={styles.input}
            value={filters.searchQuery}
            onChangeText={() => {}}
            onFocus={() => {
              onClose()
              router.navigate('/search')
            }}
            placeholder="Rechercher"
          />
        </View>
        {config?.features?.hasRegulatoryAreasFilters && <EnvFilters />}
      </View>
      <View style={globalStyle.separator} />
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

const createStyles = theme =>
  StyleSheet.create({
    emptyState: {
      paddingHorizontal: Spacing.four
    },
    input: {
      color: '#2b3a4a',
      flex: 1,
      fontSize: 17,
      paddingVertical: 0
    },
    listContent: {
      paddingBottom: Spacing.four
    },
    searchBox: {
      alignItems: 'center',
      borderColor: theme.lightGray,
      borderWidth: 1,
      flex: 1,
      flexDirection: 'row',
      height: 48,
      marginRight: Spacing.two,
      paddingHorizontal: Spacing.one
    }
  })
