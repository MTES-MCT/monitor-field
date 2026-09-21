import { storage } from '@storage'
import { ThemedText } from '@components/Elements/Text'
import { Spacing } from '@constants/theme'
import { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import { LoaderIcon } from '@components/LoaderIcon'

export function Step3({ syncPromise }: { syncPromise: Promise<unknown> }) {
  useEffect(() => {
    syncPromise.then(() => {
      storage.set('isOnBoardingFinished', true)
    })
  }, [syncPromise])

  return (
    <View style={styles.wrapper}>
      <LoaderIcon size="LARGE" tintColor="white" />

      <ThemedText themeColor="white" type="subtitle" style={styles.title}>
        Données en cours de téléchargement
      </ThemedText>
      <ThemedText themeColor="white" type="default" style={styles.text}>
        Le premier téléchargement peut prendre de quelques secondes
        {'\n'}à plusieurs minutes, {'\n'}en fonction de votre connexion.
      </ThemedText>
      <ThemedText themeColor="white" type="default" style={styles.text}>
        Veuillez rester sur cet écran pour que le téléchargement fonctionne correctement.
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
