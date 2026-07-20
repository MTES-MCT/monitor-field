import { Spacing } from '@constants/theme'
import { useAppContext } from '@contexts/AppContext'
import { useRegulatoryAreasContext } from '@contexts/RegulatoryAreasContext'
import { useTheme } from '@hooks/use-theme'
import { Image } from 'expo-image'
import { Pressable, StyleSheet, View } from 'react-native'
import { ThemedText } from '../Text'

type BottomBarProps = {
  consultRegulatoryAreas: () => void
}

export function BottomBar({ consultRegulatoryAreas }: BottomBarProps) {
  const { config } = useAppContext()
  const {
    setIsSearchZoneActive,
    isSearchZoneActive,
    searchBbox,
    setCommittedSearchBbox,
    hasSearchZoneChanged,
    setHasSearchZoneChanged,
    totalCount,
    setIsSearchByQueryActive
  } = useRegulatoryAreasContext()
  const theme = useTheme()

  const searchByBbox = async () => {
    setIsSearchZoneActive(!isSearchZoneActive)
    searchByNewBbox()
  }

  const searchByNewBbox = async () => {
    setCommittedSearchBbox(searchBbox)
    setHasSearchZoneChanged(false)
    setIsSearchByQueryActive(false)
  }

  const searchByQuery = () => {
    setIsSearchByQueryActive(true)
  }

  return (
    <View>
      {hasSearchZoneChanged && (
        <Pressable
          onPress={searchByNewBbox}
          accessibilityRole="button"
          style={[
            styles.buttonBase,
            {
              backgroundColor: theme.charcoal,
              marginBottom: Spacing.two
            }
          ]}
        >
          <ThemedText themeColor="white" type="small">
            Chercher dans cette zone
          </ThemedText>
        </Pressable>
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
            <Image
              source={require('../../../assets/icons/display.svg')}
              style={[styles.icon, { tintColor: theme.white }]}
            />
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
              <ThemedText type="small" themeColor="text">
                REG ({totalCount ?? 0})
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
            <Image source={require('../../../assets/icons/search.svg')} style={styles.icon} />
          </Pressable>
          {config.features.hasRegulatoryAreasFilters && (
            <Pressable
              onPress={searchByQuery}
              accessibilityRole="button"
              accessibilityState={{
                disabled: false
              }}
              style={[styles.buttonBase, { backgroundColor: theme.white }]}
            >
              <Image source={require('../../../assets/icons/filter.svg')} style={styles.icon} />
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
    padding: Spacing.three
  },
  displayWrapper: {
    flex: 1,
    flexDirection: 'row',
    gap: Spacing.half
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
