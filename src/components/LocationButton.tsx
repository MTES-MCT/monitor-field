import { Spacing } from '@constants/theme'
import { useAppContext } from '@contexts/AppContext'
import { useTheme } from '@hooks/use-theme'
import { useLocationStatus } from '@hooks/useLocationStatus'
import { Image } from 'expo-image'
import * as Location from 'expo-location'
import { useEffect } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'

type LocationButtonProps = {
  onLocate: (coordinates: { longitude: number; latitude: number }) => void
}

export function LocationButton({ onLocate }: LocationButtonProps) {
  const { isLocationEnabled, isLocationGranted } = useLocationStatus()
  const { isLocationButtonEnabled, setIsLocationButtonEnabled } = useAppContext()

  const theme = useTheme()

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
        // oxlint-disable-next-line no-console
        console.warn('Unable to retrieve current location', error)
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
        style={() => [styles.buttonBase, { backgroundColor: theme.white }]}
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
            styles.icon,
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
  icon: {
    height: Spacing.five,
    width: Spacing.five
  },
  wrapper: {
    alignItems: 'flex-end',
    paddingTop: Spacing.two
  }
})
