import { useAppContext, type ModalType } from '@contexts/AppContext'
import { useCameraContext } from '@contexts/CameraContext'
import { useRegulatoryAreasContext, type RegulatoryAreaListItem } from '@contexts/RegulatoryAreasContext'
import { useTheme } from '@hooks/use-theme'
import { useCallback, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'expo-router'
import { Pressable, StyleSheet, View } from 'react-native'
import { ThemedText } from '@components/Elements/Text'
import { getRegulatoryAreaLabel } from '@features/RegulatoryAreas/utils/getRegulatoryAreaLabel'
import { getRegulatoryAreasByGroup } from '@features/RegulatoryAreas/utils/getRegulatoryAreasByGroup'
import { Image } from 'expo-image'
import { CloseButton } from '@components/Buttons/CloseButton'
import { LoaderIcon } from '@components/LoaderIcon'
import { Spacing } from '@constants/theme'
import { useRegulatoryAreasLayer } from '../Layers/RegulatoryAreasLayers'

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

export function useRegulatoryAreasList({
  shouldShowResults = true,
  onClose,
  origin = undefined,
  onSelectRegulatoryArea
}: {
  shouldShowResults?: boolean
  onClose: () => void
  origin?: ModalType
  onSelectRegulatoryArea?: () => void
}) {
  const {
    clickedFeaturesList,
    regulatoryAreas,
    filters: { searchQuery },
    setIsolatedRegulatoryAreaId,
    setSelectedRegulatoryArea,
    isolatedRegulatoryAreaId
  } = useRegulatoryAreasContext()
  const { config, setActiveModal } = useAppContext()
  const { setClickedCoordinate, zoomOnRegulatoryArea } = useCameraContext()

  const theme = useTheme()
  const pathname = usePathname()
  const router = useRouter()

  const { isLoading } = useRegulatoryAreasLayer()

  const isClickedFeatureList = origin === 'CLICKED_FEATURES_LIST_MODAL'
  const sourceRegulatoryAreas = useMemo(
    () => (isClickedFeatureList ? (clickedFeaturesList ?? []) : regulatoryAreas),
    [isClickedFeatureList, clickedFeaturesList, regulatoryAreas]
  )

  const areResultsVisible = useMemo(() => {
    return shouldShowResults || searchQuery?.trim() !== undefined
  }, [searchQuery, shouldShowResults])

  const groupedRegulatoryAreas = useMemo(
    () =>
      Object.entries(getRegulatoryAreasByGroup(sourceRegulatoryAreas, config.mode)).sort(([groupA], [groupB]) =>
        groupA.localeCompare(groupB)
      ),
    [sourceRegulatoryAreas, config.mode]
  )
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})

  const selectRegulatoryArea = useCallback(
    (area: RegulatoryAreaListItem) => {
      const hasArea = sourceRegulatoryAreas.some(currentArea => currentArea.id === area.id)
      if (!hasArea) {
        return
      }

      setSelectedRegulatoryArea(area)
      setActiveModal('REGULATORY_AREA_DETAILS_MODAL')
      setClickedCoordinate(undefined)
      setExpandedGroups({})
      onSelectRegulatoryArea?.()

      if (pathname === '/search') {
        router.navigate('/')
        // adding because of the router.navigate call above
        // the map needs a moment to update after navigation
        setTimeout(() => {
          zoomOnRegulatoryArea(area)
        }, 500)

        return
      }

      zoomOnRegulatoryArea(area)
    },
    [
      zoomOnRegulatoryArea,
      sourceRegulatoryAreas,
      setSelectedRegulatoryArea,
      setActiveModal,
      setClickedCoordinate,
      pathname,
      router,
      onSelectRegulatoryArea
    ]
  )

  const clickOnGroup = useCallback(
    (group: string) => {
      const nextIsExpanded = !expandedGroups[group]
      setExpandedGroups(currentGroups => ({
        ...currentGroups,
        [group]: nextIsExpanded
      }))
    },
    [expandedGroups]
  )

  const closeModal = () => {
    setExpandedGroups({})
    onClose()
  }

  const isolateRegulatoryArea = useCallback(
    (area: RegulatoryAreaListItem) => {
      if (isolatedRegulatoryAreaId === area.id) {
        setIsolatedRegulatoryAreaId(undefined)

        return
      }

      setIsolatedRegulatoryAreaId(area.id)
      zoomOnRegulatoryArea(area)
    },
    [isolatedRegulatoryAreaId, setIsolatedRegulatoryAreaId, zoomOnRegulatoryArea]
  )

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

  const renderRow = useCallback(
    ({ item }: { item: RegulatoryRow }) => {
      if (item.type === 'group') {
        return (
          <Pressable style={styles.groupButton} onPress={() => clickOnGroup(item.group)}>
            <ThemedText type="defaultBold" style={{ flex: 1, flexWrap: 'wrap' }}>
              {item.group}
            </ThemedText>
            <ThemedText
              type="defaultBold"
              themeColor="slateGray"
            >{`${item.areas.length} / ${item.areas[0]?.totalByGroup}`}</ThemedText>
          </Pressable>
        )
      }

      const colorKey = item.area.colorKey as keyof typeof theme
      const color = theme[colorKey] ?? theme.white

      return (
        <View style={styles.wrapper}>
          <Pressable onPress={() => selectRegulatoryArea(item.area)} style={[styles.areaRow]}>
            <View
              style={{
                ...styles.square,
                backgroundColor: color,
                borderColor: theme.lightGray
              }}
            />
            <ThemedText type="default" style={{ flexShrink: 1 }}>
              {getRegulatoryAreaLabel(item.area, config.mode)}
            </ThemedText>
          </Pressable>
          {isClickedFeatureList && (
            <Pressable onPress={() => isolateRegulatoryArea(item.area)} style={styles.isolatedButton}>
              <Image
                source={require('@assets/icons/target.svg')}
                style={[
                  styles.targetIcon,
                  {
                    tintColor: isolatedRegulatoryAreaId === item.area.id ? theme.blueGray : theme.lightGray
                  }
                ]}
              />
            </Pressable>
          )}
        </View>
      )
    },
    [
      clickOnGroup,
      selectRegulatoryArea,
      isolateRegulatoryArea,
      isClickedFeatureList,
      isolatedRegulatoryAreaId,
      theme,
      config.mode
    ]
  )

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

  return {
    areResultsVisible,
    clickOnGroup,
    closeModal,
    expandedGroups,
    flattenedRows,
    isolateRegulatoryArea,
    renderHeader,
    renderRow,
    selectRegulatoryArea
  }
}

const styles = StyleSheet.create({
  areaRow: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two
  },
  emptyState: {
    paddingHorizontal: Spacing.four
  },
  groupButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.four,
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
  isolatedButton: {
    alignItems: 'center',
    flexShrink: 1,
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
