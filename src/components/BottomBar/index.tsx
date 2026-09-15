import { Spacing } from '@constants/theme'
import { useAppContext } from '@contexts/AppContext'
import { useCameraContext } from '@contexts/CameraContext'
import { useRegulatoryAreasContext } from '@contexts/RegulatoryAreasContext'
import { useTheme } from '@hooks/use-theme'
import { Image } from 'expo-image'
import { Pressable, StyleSheet, View } from 'react-native'
import { ThemedText } from '../Elements/Text'
import { EnvFilters } from '@features/RegulatoryAreas/FilteredRegulatoryAreas/EnvFilters'
import { useGlobalStyle } from '@globalStyle'
import { LoaderIcon } from '@components/LoaderIcon'
import { useMemo } from 'react'

type BottomBarProps = {
  isLoading: boolean
  searchByQuery: () => void
}

export function BottomBar({ isLoading, searchByQuery }: BottomBarProps) {
  const { config, setActiveModal } = useAppContext()
  const globalStyle = useGlobalStyle()
  const theme = useTheme()

  const { zoomToBbox } = useCameraContext()

  const {
    committedSearchBbox,
    committedSearchZoom,
    currentZoom,
    setIsSearchZoneActive,
    isSearchZoneActive,
    searchBbox,
    setCommittedSearchBbox,
    setCommittedSearchZoom,
    setSearchBbox,
    totalCount,
    filters,
    areRegulatoryAreasLayerVisible,
    setAreRegulatoryAreasLayerVisible
  } = useRegulatoryAreasContext()

  const hasSearchZoneChanged = useMemo(() => {
    if (!searchBbox || !committedSearchBbox) {
      return false
    }
    return (
      searchBbox.minLat !== committedSearchBbox.minLat ||
      searchBbox.maxLat !== committedSearchBbox.maxLat ||
      searchBbox.minLon !== committedSearchBbox.minLon ||
      searchBbox.maxLon !== committedSearchBbox.maxLon
    )
  }, [searchBbox, committedSearchBbox])

  const searchByBbox = async () => {
    setIsSearchZoneActive(!isSearchZoneActive)
    setAreRegulatoryAreasLayerVisible(true)
    searchByNewBbox()
  }

  const searchByNewBbox = async () => {
    setCommittedSearchBbox(searchBbox)
    setCommittedSearchZoom(currentZoom)
  }

  const centerOnSearchBox = () => {
    if (committedSearchBbox) {
      const centerLat = (committedSearchBbox.minLat + committedSearchBbox.maxLat) / 2
      const centerLon = (committedSearchBbox.minLon + committedSearchBbox.maxLon) / 2
      zoomToBbox({ centerLat, centerLon, zoom: committedSearchZoom })
      setSearchBbox(committedSearchBbox)
    }
  }

  const handleLayers = () => {
    setAreRegulatoryAreasLayerVisible(!areRegulatoryAreasLayerVisible)
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
              style={[globalStyle.iconNormal, { marginRight: Spacing.two, tintColor: theme.slateGray }]}
            />
            <ThemedText themeColor="slateGray" type="small">
              Recentrer
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={searchByNewBbox}
            accessibilityRole="button"
            style={[
              [
                globalStyle.squareButton,
                { backgroundColor: theme.charcoal, flex: 1, flexDirection: 'row', marginBottom: Spacing.two }
              ]
            ]}
          >
            <Image
              source={require('@assets/icons/display.svg')}
              style={[globalStyle.iconNormal, { marginRight: Spacing.two, tintColor: theme.white }]}
            />
            <ThemedText themeColor="white" type="small">
              Afficher les reg. ici
            </ThemedText>
          </Pressable>
        </View>
      )}
      <View style={styles.wrapper}>
        <View style={styles.displayWrapper}>
          {isSearchZoneActive ? (
            <>
              <Pressable
                onPress={handleLayers}
                accessibilityRole="button"
                style={[
                  globalStyle.squareButton,
                  {
                    backgroundColor: areRegulatoryAreasLayerVisible ? theme.blueGray : theme.white
                  }
                ]}
              >
                <Image
                  source={
                    areRegulatoryAreasLayerVisible
                      ? require('@assets/icons/display.svg')
                      : require('@assets/icons/hide.svg')
                  }
                  style={[
                    globalStyle.iconNormal,
                    { tintColor: areRegulatoryAreasLayerVisible ? theme.white : theme.slateGray }
                  ]}
                />
              </Pressable>
              <Pressable
                onPress={() => setActiveModal('REGULATORY_AREAS_LIST_MODAL')}
                accessibilityRole="button"
                accessibilityState={{
                  disabled: false,
                  selected: isSearchZoneActive
                }}
                style={[
                  globalStyle.squareButton,
                  {
                    backgroundColor: theme.white,
                    flex: 1,
                    flexDirection: 'row',
                    gap: Spacing.two
                  }
                ]}
              >
                <ThemedText type="defaultBold" themeColor="text">
                  REG{' '}
                  <ThemedText type="defaultBold" themeColor="slateGray">
                    ({totalCount ?? 0})
                  </ThemedText>
                </ThemedText>
                {isLoading && <LoaderIcon tintColor="slateGray" size="SMALL" />}
              </Pressable>
            </>
          ) : (
            <Pressable
              onPress={searchByBbox}
              accessibilityRole="button"
              style={[
                globalStyle.squareButton,
                {
                  backgroundColor: theme.charcoal,
                  flex: 1
                }
              ]}
            >
              <ThemedText type="small" themeColor="white" style={{ marginLeft: Spacing.two }}>
                Afficher les reg.ici
              </ThemedText>
            </Pressable>
          )}
        </View>
        <View style={styles.searchAndFilterWrapper}>
          <Pressable
            onPress={searchByQuery}
            accessibilityRole="link"
            accessibilityState={{
              disabled: false
            }}
            style={[globalStyle.squareButton, { backgroundColor: theme.white }]}
          >
            {filters.searchQuery && <View style={globalStyle.dot} />}
            <Image
              source={require('@assets/icons/search.svg')}
              style={[globalStyle.iconNormal, { tintColor: filters.searchQuery ? theme.blueGray : theme.slateGray }]}
            />
          </Pressable>

          {config.features.hasRegulatoryAreasFilters && <EnvFilters />}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  buttonBase: {
    alignItems: 'center',
    boxShadow: '0px 3px 6px rgba(112, 119, 133, 0.25)',
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
  searchAndFilterWrapper: {
    flexDirection: 'row',
    gap: Spacing.half
  },
  wrapper: {
    flexDirection: 'row',
    gap: Spacing.two
  }
})
