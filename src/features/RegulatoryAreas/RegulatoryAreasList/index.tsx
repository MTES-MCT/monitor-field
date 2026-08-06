import type { BoundingBox } from '@/types/mapTypes'
import { ThemedText } from '@components/Text'
import { Spacing } from '@constants/theme'
import { type RegulatoryAreaListItem, useRegulatoryAreasContext } from '@contexts/RegulatoryAreasContext'
import { BottomSheetFlatList } from '@gorhom/bottom-sheet'
import { useTheme } from '@hooks/use-theme'
import { useMemo, useState } from 'react'
import { Pressable, StyleSheet, TouchableOpacity, View } from 'react-native'
import { getRegulatoryAreaLabel } from '../utils/getRegulatoryAreaLabel'
import { getRegulatoryAreasByGroup } from './utils'
import { Image } from 'expo-image'
import { useAppContext } from '@contexts/AppContext'

type RegulatoryAreasListProps = {
  onFocusGroupOrRegulatoryArea: (bbox: BoundingBox) => void
  onClose: () => void
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

function getGroupBoundingBox(areas: RegulatoryAreaListItem[]): BoundingBox | undefined {
  if (areas.length === 0 || !areas[0]?.bbox) {
    return undefined
  }

  return areas.reduce<BoundingBox>(
    (bbox, area) => ({
      maxLat: Math.max(bbox.maxLat, area.bbox.maxLat),
      maxLon: Math.max(bbox.maxLon, area.bbox.maxLon),
      minLat: Math.min(bbox.minLat, area.bbox.minLat),
      minLon: Math.min(bbox.minLon, area.bbox.minLon)
    }),
    { ...areas[0].bbox }
  )
}

export const RegulatoryAreasList = ({ onFocusGroupOrRegulatoryArea, onClose }: RegulatoryAreasListProps) => {
  const {
    clickedFeaturesList,
    regulatoryAreas,
    setSelectedRegulatoryArea,
    setIsolatedRegulatoryArea,
    isolatedRegulatoryArea
  } = useRegulatoryAreasContext()
  const { config } = useAppContext()

  const theme = useTheme()
  const sourceRegulatoryAreas = clickedFeaturesList ?? regulatoryAreas
  const isClickedFeatureList = !!clickedFeaturesList

  const groupedRegulatoryAreas = useMemo(
    () => Object.entries(getRegulatoryAreasByGroup(sourceRegulatoryAreas, config.mode)),
    [sourceRegulatoryAreas, config.mode]
  )
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})

  const selectRegulatoryArea = (area: RegulatoryAreaListItem) => {
    const hasArea = regulatoryAreas.some(currentArea => currentArea.id === area.id)
    if (!hasArea) {
      return
    }

    setSelectedRegulatoryArea(area)
    onFocusGroupOrRegulatoryArea?.(area.bbox)
  }

  const clickOnGroup = (group: string, areas: RegulatoryAreaListItem[]) => {
    const nextIsExpanded = !expandedGroups[group]
    setExpandedGroups(currentGroups => ({
      ...currentGroups,
      [group]: nextIsExpanded
    }))

    if (nextIsExpanded && onFocusGroupOrRegulatoryArea) {
      const groupBoundingBox = getGroupBoundingBox(areas)
      if (groupBoundingBox) {
        onFocusGroupOrRegulatoryArea(groupBoundingBox)
      }
    }
  }

  const closeModal = () => {
    setExpandedGroups({})
    onClose()
  }

  const isolateRegulatoryArea = (area: RegulatoryAreaListItem) => {
    if (isolatedRegulatoryArea === area.id) {
      setIsolatedRegulatoryArea(undefined)

      return
    }

    setIsolatedRegulatoryArea(area.id)
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
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.groupButton}
          onPress={() => clickOnGroup(item.group, item.areas)}
        >
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
                  tintColor: isolatedRegulatoryArea === item.area.id ? theme.blueGray : theme.lightGray
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
          <Pressable accessibilityRole="button" onPress={closeModal}>
            <Image source={require('../../../../assets/icons/close.svg')} style={styles.closeIcon} />
          </Pressable>
        </View>
      )
    }

    return (
      <View style={styles.headerRow}>
        <ThemedText type="defaultBold">{`REG (${sourceRegulatoryAreas.length ?? 0}) sur la zone`}</ThemedText>
      </View>
    )
  }
  return (
    <BottomSheetFlatList
      style={{ marginBottom: Spacing.six }}
      data={flattenedRows}
      extraData={expandedGroups}
      keyExtractor={item => (item.type === 'group' ? `group-${item.group}` : `area-${item.group}-${item.area.id}`)}
      renderItem={renderRow}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={renderHeader()}
      ListEmptyComponent={
        <ThemedText type="small" themeColor="textSecondary" style={styles.emptyState}>
          Aucune zone réglementaire ne correspond à cette recherche.
        </ThemedText>
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
  closeIcon: {
    height: Spacing.five,
    width: Spacing.five
  },
  emptyState: {
    paddingHorizontal: Spacing.four
  },
  groupButton: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three
  },
  headerRow: {
    alignItems: 'center',
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
    justifyContent: 'space-between'
  }
})
