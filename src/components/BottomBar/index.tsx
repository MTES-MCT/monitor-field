import { Spacing } from '@constants/theme'
import { useAppContext } from '@contexts/AppContext'
import { useRegulatoryAreasContext } from '@contexts/RegulatoryAreasContext'
import { useTheme } from '@hooks/use-theme'
import { Image } from 'expo-image'
import { Pressable, StyleSheet, View } from 'react-native'
import { ThemedText } from '../Elements/Text'
import { EnvFilters } from '@features/RegulatoryAreas/FilteredRegulatoryAreas/EnvFilters'
import { useGlobalStyle } from '@globalStyle'
import { LoaderIcon } from '@components/LoaderIcon'

type BottomBarProps = {
  isLoading: boolean
  searchByQuery: () => void
}

export function BottomBar({ isLoading, searchByQuery }: BottomBarProps) {
  const { config, setActiveModal } = useAppContext()
  const globalStyle = useGlobalStyle()
  const theme = useTheme()

  const { areRegulatoryAreasLayerVisible, setAreRegulatoryAreasLayerVisible, totalCount, filters } =
    useRegulatoryAreasContext()

  const handleLayers = () => {
    setAreRegulatoryAreasLayerVisible(!areRegulatoryAreasLayerVisible)
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.displayWrapper}>
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
              areRegulatoryAreasLayerVisible ? require('@assets/icons/display.svg') : require('@assets/icons/hide.svg')
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
  )
}

const styles = StyleSheet.create({
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
