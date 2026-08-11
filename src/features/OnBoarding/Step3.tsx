import { storage } from '@storage'
import { ThemedText } from '@components/Elements/Text'
import { Spacing } from '@constants/theme'
import { Image } from 'expo-image'
import { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import Animated from 'react-native-reanimated'

export function Step3({ syncPromise }: { syncPromise: Promise<void> }) {
  useEffect(() => {
    syncPromise.then(() => {
      storage.set('isOnBoardingFinished', true)
    })
  }, [syncPromise])

  return (
    <View style={styles.wrapper}>
      <Animated.View
        style={{
          animationDuration: '2s',
          animationIterationCount: 'infinite',
          animationName: {
            '100%': {
              transform: [{ rotate: '360deg' }]
            }
          },
          animationTimingFunction: 'linear'
        }}
      >
        <Image source={require('@assets/icons/recurring.svg')} style={{ height: 32, width: 32 }} />
      </Animated.View>

      <ThemedText themeColor="white" type="subtitle" style={styles.title}>
        Données en cours de téléchargement
      </ThemedText>
      <ThemedText themeColor="white" type="default" style={styles.text}>
        Veuillez patienter encore {'\n'} quelques instants.
      </ThemedText>
    </View>
  )
}

const styles = StyleSheet.create({
  text: {
    textAlign: 'center'
  },
  title: {
    paddingBottom: Spacing.six,
    textAlign: 'center'
  },
  wrapper: {
    alignItems: 'center',
    flex: 1,
    gap: Spacing.four,
    justifyContent: 'center',
    padding: 55
  }
})
