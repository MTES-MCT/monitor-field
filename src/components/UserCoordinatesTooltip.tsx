import { ThemedText } from '@components/Elements/Text'
import { Spacing } from '@constants/theme'
import { useGlobalStyle } from '@globalStyle'
import { useTheme } from '@hooks/use-theme'
import { useThemedStyles } from '@hooks/use-themed-styles'
import { Marker } from '@maplibre/maplibre-react-native'
import { formatCoordinates } from '@utils/formatCoordinates'
import * as Clipboard from 'expo-clipboard'
import { Image } from 'expo-image'
import { StyleSheet, View } from 'react-native'

type UserCoordinatesTooltipProps = {
  coordinates: { latitude: number; longitude: number }
  closeMarker: () => void
}

const COPIED_FEEDBACK_DURATION = 120000

/**
 * The whole Marker is the copy target: on Android the map intercepts taps on a Marker and only
 * forwards a single onPress for it, so Pressables inside it never fire.
 * Closing is handled by the map's onPress (a tap anywhere outside the Marker).
 */
export function UserCoordinatesTooltip({ coordinates, closeMarker }: UserCoordinatesTooltipProps) {
  const theme = useTheme()
  const globalStyle = useGlobalStyle()
  const styles = useThemedStyles(createStyles)
  const formattedCoordinates = formatCoordinates(coordinates)

  const copyCoordinates = async () => {
    await Clipboard.setStringAsync(formattedCoordinates)
    setTimeout(() => {
      closeMarker()
    }, COPIED_FEEDBACK_DURATION)
  }

  return (
    <Marker
      id="userCoordinatesTooltip"
      lngLat={[coordinates.longitude, coordinates.latitude]}
      anchor="bottom"
      offset={[0, -16]}
      onPress={copyCoordinates}
      style={styles.marker}
    >
      <View style={styles.wrapper} accessibilityRole="button" accessibilityLabel="Copier les coordonnées">
        <Image
          source={require('@assets/icons/copy.svg')}
          style={[globalStyle.iconSmall, { tintColor: theme.slateGray }]}
        />
        <ThemedText type="small">{formattedCoordinates}</ThemedText>
      </View>
    </Marker>
  )
}

const createStyles = theme =>
  StyleSheet.create({
    marker: {
      position: 'absolute'
    },
    wrapper: {
      alignItems: 'center',
      backgroundColor: theme.cultured,
      borderColor: theme.lightGray,
      borderWidth: 1,
      flexDirection: 'row',
      gap: Spacing.two,
      paddingHorizontal: Spacing.two,
      paddingVertical: Spacing.two
    }
  })
