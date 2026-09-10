import { ThemedText } from '@components/Elements/Text'
import { Spacing } from '@constants/theme'
import { type RegulatoryAreaListItem, useRegulatoryAreasContext } from '@contexts/RegulatoryAreasContext'
import { BottomSheetFlatList } from '@gorhom/bottom-sheet'
import { useTheme } from '@hooks/use-theme'
import { useMemo, useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { getRegulatoryAreaLabel } from '../utils/getRegulatoryAreaLabel'
import { getRegulatoryAreasByGroup } from './utils'
import { Image } from 'expo-image'
import { useAppContext, type ModalType } from '@contexts/AppContext'
import { CloseButton } from '@components/Buttons/CloseButton'
import { LoaderIcon } from '@components/LoaderIcon'

type RegulatoryAreasListProps = {
  onClose: () => void
  isLoading: boolean
  focusAndSetOrgin: (area: RegulatoryAreaListItem, activeModal: ModalType) => void
  shouldShowResults?: boolean
}

type GroupRow = {
  type: 'group'
  group: string
  areas: RegulatoryAreaListItem[]
}

type AreaRow = {
  type: 'area'
  group: string
  area: RegulatoryAreaListItem
}

type RegulatoryRow = GroupRow | AreaRow

export const RegulatoryAreasList = ({
  onClose,
  isLoading,
  focusAndSetOrgin,
  shouldShowResults = true
}: RegulatoryAreasListProps) => {
  const {
    clickedFeaturesList,
    regulatoryAreas,
    filters: { searchQuery },
    setIsolatedRegulatoryAreaId,
    isolatedRegulatoryAreaId,
    isSearchZoneActive
  } = useRegulatoryAreasContext()
  const { config, activeModal } = useAppContext()
  const theme = useTheme()
  const sourceRegulatoryAreas = clickedFeaturesList ?? regulatoryAreas
  const isClickedFeatureList = !!clickedFeaturesList

  const areResultsVisible = useMemo(() => {
    return shouldShowResults || isSearchZoneActive || searchQuery?.trim() !== undefined
  }, [shouldShowResults, isSearchZoneActive, searchQuery])

  const groupedRegulatoryAreas = useMemo(
    () =>
      Object.entries(getRegulatoryAreasByGroup(sourceRegulatoryAreas, config.mode)).sort(([groupA], [groupB]) =>
        groupA.localeCompare(groupB)
      ),
    [sourceRegulatoryAreas, config.mode]
  )
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})

  const selectRegulatoryArea = (area: RegulatoryAreaListItem) => {
    const hasArea = regulatoryAreas.some(currentArea => currentArea.id === area.id)
    if (!hasArea) {
      return
    }

    focusAndSetOrgin(area, activeModal)
  }

  const clickOnGroup = (group: string) => {
    const nextIsExpanded = !expandedGroups[group]
    setExpandedGroups(currentGroups => ({
      ...currentGroups,
      [group]: nextIsExpanded
    }))
  }

  const closeModal = () => {
    setExpandedGroups({})
    onClose()
  }

  const isolateRegulatoryArea = (area: RegulatoryAreaListItem) => {
    if (isolatedRegulatoryAreaId === area.id) {
      setIsolatedRegulatoryAreaId(undefined)

      return
    }

    setIsolatedRegulatoryAreaId(area.id)
  }

  const flattenedRows = useMemo<RegulatoryRow[]>(() => {
    return groupedRegulatoryAreas.flatMap(([group, areas]) => {
      const rows: RegulatoryRow[] = [{ areas, group, type: 'group' }]

      if (expandedGroups[group]) {
        rows.push(
          ...areas.map(area => ({
            area,
            group,
            type: 'area' as const
          }))
        )
      }

      return rows
    })
  }, [expandedGroups, groupedRegulatoryAreas])

  const renderRow = ({ item }: { item: RegulatoryRow }) => {
    if (item.type === 'group') {
      return (
        <TouchableOpacity activeOpacity={0.7} style={styles.groupButton} onPress={() => clickOnGroup(item.group)}>
          <ThemedText type="defaultBold">{item.group}</ThemedText>
        </TouchableOpacity>
      )
    }

    const colorKey = item.area.fillColor as keyof typeof theme
    const color = theme[colorKey] ?? theme.white

    return (
      <View style={styles.wrapper}>
        <TouchableOpacity activeOpacity={0.7} onPress={() => selectRegulatoryArea(item.area)} style={styles.areaRow}>
          <View
            style={{
              ...styles.square,
              backgroundColor: color,
              borderColor: theme.lightGray
            }}
          />
          <ThemedText type="default">{getRegulatoryAreaLabel(item.area, config.mode)}</ThemedText>
        </TouchableOpacity>
        {isClickedFeatureList && (
          <TouchableOpacity activeOpacity={0.7} onPress={() => isolateRegulatoryArea(item.area)} style={styles.areaRow}>
            <Image
              source={require('../../../../assets/icons/target.svg')}
              style={[
                styles.targetIcon,
                {
                  tintColor: isolatedRegulatoryAreaId === item.area.id ? theme.blueGray : theme.lightGray
                }
              ]}
            />
          </TouchableOpacity>
        )}
      </View>
    )
  }

  const renderHeader = () => {
    if (isClickedFeatureList) {
      return (
        <View style={[styles.headerRowWithTitle, { backgroundColor: theme.lightGray }]}>
          <ThemedText type="default">{`${clickedFeaturesList?.length ?? 0} zones superposées sur ce point`}</ThemedText>
          <CloseButton onClose={closeModal} />
        </View>
      )
    }

    return (
      <View style={styles.headerRow}>
        <ThemedText type="defaultBold">{`REG (${sourceRegulatoryAreas.length ?? 0}) sur la zone`}</ThemedText>
        {isLoading && <LoaderIcon tintColor="slateGray" size="SMALL" />}
      </View>
    )
  }

  return (
    <BottomSheetFlatList
      style={{ marginBottom: Spacing.six }}
      data={areResultsVisible ? flattenedRows : []}
      extraData={expandedGroups}
      keyExtractor={item => (item.type === 'group' ? `group-${item.group}` : `area-${item.group}-${item.area.id}`)}
      renderItem={renderRow}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={renderHeader()}
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
  )
}

const styles = StyleSheet.create({
  areaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.two,
    maxWidth: '80%',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two
  },
  emptyState: {
    paddingHorizontal: Spacing.four
  },
  groupButton: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.two,
    justifyContent: 'center',
    paddingVertical: Spacing.two
  },
  headerRowWithTitle: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two
  },
  listContent: {
    paddingBottom: Spacing.four
  },
  square: {
    borderWidth: 1,
    height: 20,
    width: 20
  },
  targetIcon: {
    height: 20,
    width: 20
  },
  wrapper: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48
  }
})
