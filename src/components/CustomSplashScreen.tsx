import { useEffect } from 'react'
import { View, StyleSheet, useWindowDimensions } from 'react-native'
import * as SplashScreen from 'expo-splash-screen'
import { Image } from 'expo-image'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from 'react-native-reanimated'
import { ThemedText } from './Elements/Text'
import { Spacing } from '@constants/theme'
import { useGlobalStyle } from '@globalStyle'
import { useThemedStyles } from '@hooks/use-themed-styles'

const ICON_SIZE = 48
const FISH_MOVE_DURATION = 1500
const FISH_PAUSE_DURATION = 1000

// Keep the native splash visible until this custom one is ready to take over
SplashScreen.preventAutoHideAsync()

export function CustomSplashScreen() {
  const globalStyle = useGlobalStyle()
  const styles = useThemedStyles(createStyles)
  const { width: screenWidth } = useWindowDimensions()
  const fishTranslateX = useSharedValue(0)

  useEffect(() => {
    SplashScreen.hideAsync()
  }, [])

  useEffect(() => {
    const offscreenOffset = screenWidth / 2 + ICON_SIZE

    fishTranslateX.value = -offscreenOffset
    fishTranslateX.value = withRepeat(
      withSequence(
        withTiming(0, { duration: FISH_MOVE_DURATION, easing: Easing.out(Easing.ease) }),
        withTiming(0, { duration: FISH_PAUSE_DURATION }),
        withTiming(offscreenOffset, { duration: FISH_MOVE_DURATION, easing: Easing.in(Easing.ease) }),
        withTiming(-offscreenOffset, { duration: 0 })
      ),
      -1,
      false
    )
  }, [fishTranslateX, screenWidth])

  const fishAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: fishTranslateX.value }]
  }))

  return (
    <View style={styles.container}>
      <View />
      <View style={[styles.iconContainer, { width: screenWidth }]}>
        <Image source={require('@assets/icons/algae.svg')} style={[globalStyle.iconLarge, styles.algaeIcon]} />
        <Animated.View style={[styles.fishWrapper, fishAnimatedStyle]}>
          <Image source={require('@assets/icons/fish.svg')} style={globalStyle.iconLarge} />
        </Animated.View>
      </View>
      <View style={styles.textContainer}>
        <ThemedText type="subtitle" themeColor="white">
          Monitorfield
        </ThemedText>
        <ThemedText type="default" themeColor="white">
          version de test
        </ThemedText>
      </View>
    </View>
  )
}

const createStyles = theme =>
  StyleSheet.create({
    algaeIcon: {
      left: '50%',
      marginLeft: -(ICON_SIZE / 2),
      position: 'absolute',
      tintColor: theme.mediumSeaGreen,
      top: Spacing.five,
      zIndex: 1
    },
    container: {
      alignItems: 'center',
      backgroundColor: theme.gunMetal,
      flex: 1,
      justifyContent: 'space-between'
    },
    fishWrapper: {
      // centered in the full-width container; translateX moves it left/right across the screen
      left: '45%',
      marginLeft: -(ICON_SIZE / 2),
      position: 'absolute',
      top: 0,
      zIndex: 0
    },
    iconContainer: {
      height: ICON_SIZE + Spacing.five,
      overflow: 'hidden'
    },
    textContainer: {
      alignItems: 'center',
      flexDirection: 'column',
      paddingBottom: 56
    }
  })
