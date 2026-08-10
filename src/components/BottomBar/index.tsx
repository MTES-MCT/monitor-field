import { Spacing } from '@constants/theme'
import { useAppContext } from '@contexts/AppContext'
import { useRegulatoryAreasContext } from '@contexts/RegulatoryAreasContext'
import { useTheme } from '@hooks/use-theme'
import { Image } from 'expo-image'
import { Pressable, StyleSheet, View } from 'react-native'
import { ThemedText } from '../Text'

type BottomBarProps = {
  consultRegulatoryAreas: () => void
  zoomToBbox: (centerLat: number, centerLon: number, zoom: number | undefined) => void
}

export function BottomBar({ consultRegulatoryAreas, zoomToBbox }: BottomBarProps) {
  const { config } = useAppContext()
  const {
    committedSearchBbox,
    committedSearchZoom,
    currentZoom,
    setIsSearchZoneActive,
    isSearchZoneActive,
    searchBbox,
    setCommittedSearchBbox,
    setCommittedSearchZoom,
    hasSearchZoneChanged,
    setHasSearchZoneChanged,
    setSearchBbox,
    totalCount,
    setIsSearchByQueryActive,
    filters
  } = useRegulatoryAreasContext()
  const theme = useTheme()

  const searchByBbox = async () => {
    setIsSearchZoneActive(!isSearchZoneActive)
    searchByNewBbox()
  }

  const searchByNewBbox = async () => {
    setCommittedSearchBbox(searchBbox)
    setCommittedSearchZoom(currentZoom)
    setHasSearchZoneChanged(false)
    setIsSearchByQueryActive(false)
  }

  const centerOnSearchBox = () => {
    if (committedSearchBbox) {
      const centerLat = (committedSearchBbox.minLat + committedSearchBbox.maxLat) / 2
      const centerLon = (committedSearchBbox.minLon + committedSearchBbox.maxLon) / 2
      zoomToBbox(centerLat, centerLon, committedSearchZoom)
      setSearchBbox(committedSearchBbox)
      setHasSearchZoneChanged(false)
    }
  }

  const searchByQuery = () => {
    setIsSearchByQueryActive(true)
  }

  return (
    <View>
      {hasSearchZoneChanged && (
        <View style={styles.wrapper}>
          <Pressable
            onPress={centerOnSearchBox}
            accessibilityRole="button"
            style={[
              styles.buttonBase,
              {
                backgroundColor: theme.white,
                marginBottom: Spacing.two
              }
            ]}
          >
            <Image
              source={require('@assets/icons/select-rectangle.svg')}
              style={[styles.icon, { marginRight: Spacing.two, tintColor: theme.slateGray }]}
            />
            <ThemedText themeColor="slateGray" type="small">
              Recentrer
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={searchByNewBbox}
            accessibilityRole="button"
            style={[
              styles.buttonBase,
              {
                backgroundColor: theme.charcoal,
                flex: 1,
                marginBottom: Spacing.two
              }
            ]}
          >
            <Image
              source={require('@assets/icons/display.svg')}
              style={[styles.icon, { marginRight: Spacing.two, tintColor: theme.white }]}
            />
            <ThemedText themeColor="white" type="small">
              Afficher les reg. ici
            </ThemedText>
          </Pressable>
        </View>
      )}
      <View style={styles.wrapper}>
        <View style={styles.displayWrapper}>
          <Pressable
            onPress={searchByBbox}
            accessibilityRole="button"
            style={[
              styles.buttonBase,
              {
                backgroundColor: isSearchZoneActive ? theme.blueGray : theme.charcoal,
                flex: !isSearchZoneActive ? 1 : 0
              }
            ]}
          >
            <Image source={require('@assets/icons/display.svg')} style={[styles.icon, { tintColor: theme.white }]} />
            {!isSearchZoneActive && (
              <ThemedText type="small" themeColor="white" style={{ marginLeft: Spacing.two }}>
                Afficher les reg.ici
              </ThemedText>
            )}
          </Pressable>
          {isSearchZoneActive && (
            <Pressable
              onPress={consultRegulatoryAreas}
              accessibilityRole="button"
              accessibilityState={{
                disabled: false,
                selected: isSearchZoneActive
              }}
              style={[
                styles.buttonBase,
                {
                  backgroundColor: theme.white,
                  flex: 1
                }
              ]}
            >
              <ThemedText type="defaultBold" themeColor="text">
                REG{' '}
                <ThemedText type="defaultBold" themeColor="slateGray">
                  ({totalCount ?? 0})
                </ThemedText>
              </ThemedText>
            </Pressable>
          )}
        </View>
        <View style={styles.searchAndFilterWrapper}>
          <Pressable
            onPress={searchByQuery}
            accessibilityRole="button"
            accessibilityState={{
              disabled: false
            }}
            style={[styles.buttonBase, { backgroundColor: theme.white }]}
          >
            {filters.searchQuery && <View style={[styles.dot, { backgroundColor: theme.blueGray }]} />}
            <Image source={require('@assets/icons/search.svg')} style={styles.icon} />
          </Pressable>
          {config.features.hasRegulatoryAreasFilters && (
            <Pressable
              onPress={searchByQuery}
              accessibilityRole="button"
              accessibilityState={{
                disabled: false
              }}
              style={[styles.buttonBase, { backgroundColor: theme.white, zIndex: -1 }]}
            >
              <Image source={require('@assets/icons/filter.svg')} style={styles.icon} />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  buttonBase: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    padding: Spacing.three,
    position: 'relative'
  },
  displayWrapper: {
    flex: 1,
    flexDirection: 'row',
    gap: Spacing.half
  },
  dot: {
    borderRadius: '50%',
    height: 20,
    left: 35,
    position: 'absolute',
    top: -10,
    width: 20
  },
  icon: {
    height: Spacing.five,
    width: Spacing.five
  },
  searchAndFilterWrapper: {
    flexDirection: 'row',
    gap: Spacing.half
  },
  wrapper: {
    flexDirection: 'row',
    gap: Spacing.two
  }
})
