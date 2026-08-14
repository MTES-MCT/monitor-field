import { Spacing } from '@constants/theme'
import { useAppContext } from '@contexts/AppContext'
import { useTheme } from '@hooks/use-theme'
import { useGlobalStyle } from '@globalStyle'
import { useLocationStatus } from '@hooks/useLocationStatus'
import { Image } from 'expo-image'
import * as Location from 'expo-location'
import { useEffect } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { logSentryError } from '@utils/sentryLogger'

type LocationButtonProps = {
  onLocate: (coordinates: { longitude: number; latitude: number }) => void
}

export function LocationButton({ onLocate }: LocationButtonProps) {
  const { isLocationEnabled, isLocationGranted } = useLocationStatus()
  const { isLocationButtonEnabled, setIsLocationButtonEnabled } = useAppContext()

  const theme = useTheme()
  const globalStyle = useGlobalStyle()

  const isButtonDisabled = !isLocationEnabled || !isLocationGranted
  const iconTintColor = isLocationButtonEnabled && !isButtonDisabled ? theme.blueGray : theme.slateGray

  useEffect(() => {
    if (!isLocationEnabled) {
      setIsLocationButtonEnabled(false)
    }
  }, [isLocationEnabled, setIsLocationButtonEnabled])

  const getLocation = async () => {
    if (!isLocationGranted) {
      return
    }

    if (!isLocationButtonEnabled) {
      try {
        const position = await Location.getCurrentPositionAsync({})
        if (!position) {
          return
        }

        onLocate({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })
      } catch (error) {
        logSentryError(error, 'Unable to retrieve current location')
      }
    }
    setIsLocationButtonEnabled(!isLocationButtonEnabled)
  }

  return (
    <View style={styles.wrapper}>
      <Pressable
        onPress={getLocation}
        accessibilityRole="button"
        accessibilityState={{
          disabled: isButtonDisabled
        }}
        style={[styles.buttonBase, { backgroundColor: theme.white }]}
      >
        <Image
          key={`${isLocationGranted}-${isLocationEnabled}`}
          source={
            !isLocationEnabled || !isLocationGranted
              ? require('@assets/icons/location-disabled.svg')
              : require('@assets/icons/location.svg')
          }
          cachePolicy="none"
          transition={0}
          style={[
            globalStyle.iconNormal,
            {
              tintColor: iconTintColor
            }
          ]}
        />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  buttonBase: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    width: 48
  },
  wrapper: {
    alignItems: 'flex-end',
    paddingTop: Spacing.two
  }
})
