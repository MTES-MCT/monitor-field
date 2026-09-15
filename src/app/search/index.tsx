import { useTheme } from '@hooks/use-theme'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRegulatoryAreasContext } from '@contexts/RegulatoryAreasContext'
import { useRouter } from 'expo-router'
import { SearchInput } from '@features/Search/SearchInput'
import { FlatList } from 'react-native-gesture-handler'
import { ThemedText } from '@components/Elements/Text'
import { StyleSheet, View } from 'react-native'
import { Spacing } from '@constants/theme'
import { useRegulatoryAreasList } from '@features/RegulatoryAreas/hooks/useRegulatoryAreasList'

export default function SearchPage() {
  const theme = useTheme()
  const router = useRouter()
  const { isSearchZoneActive, filters, setFilters } = useRegulatoryAreasContext()

  const shouldShowResults = isSearchZoneActive || !!filters.searchQuery?.trim()

  const onDismiss = () => {
    if (!shouldShowResults && !isSearchZoneActive) {
      setFilters(currentFilters => ({
        ...currentFilters,
        searchQuery: undefined
      }))
    }
    router.back()
  }

  const { flattenedRows, expandedGroups, renderRow, renderHeader, areResultsVisible } = useRegulatoryAreasList({
    onClose: onDismiss,
    shouldShowResults
  })

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SearchInput onClose={onDismiss} />
      <FlatList
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
    </SafeAreaView>
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
