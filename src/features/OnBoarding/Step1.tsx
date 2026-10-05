import { ThemedText } from '@components/Elements/Text'
import { Pressable, StyleSheet, TextInput, ToastAndroid, View } from 'react-native'
import { useThemedStyles } from '@hooks/use-themed-styles'
import { Image } from 'expo-image'
import { Spacing } from '@constants/theme'
import { useGlobalStyle } from '@globalStyle'
import { useState, useRef } from 'react'
import { useTheme } from '@hooks/use-theme'
import { SafeAreaView } from 'react-native-safe-area-context'

const MONITOR_PASSWORD = process.env.EXPO_PUBLIC_PASSWORD
const ICON_SIZE = 80

export function Step1({ setCurrentStep }: { setCurrentStep: () => void }) {
  const inputRef = useRef<TextInput>(null)
  const theme = useTheme()
  const styles = useThemedStyles(createStyles)
  const globalStyle = useGlobalStyle()

  const [password, setPassword] = useState('')

  const validatePassword = () => {
    inputRef.current?.blur()

    // setTimeout to show the toast message after keyboard dismissal
    setTimeout(() => {
      if (password === MONITOR_PASSWORD) {
        setCurrentStep()

        return
      }
      ToastAndroid.show('Le mot de passe est incorrect', ToastAndroid.SHORT)
    }, 800)
  }

  return (
    <SafeAreaView style={styles.container}>
      <Image source={require('@assets/images/splash-icon.png')} style={styles.algaeIcon} />

      <View style={styles.buttonsWrapper}>
        <View style={[globalStyle.searchBoxGray, { backgroundColor: theme.gainsboro, flex: 0 }]}>
          <TextInput
            ref={inputRef}
            value={password}
            onChangeText={setPassword}
            placeholder="Mot de passe"
            secureTextEntry
            style={[globalStyle.input]}
            onSubmitEditing={validatePassword}
          />
        </View>
        <Pressable
          disabled={!password}
          onPress={validatePassword}
          accessibilityRole="button"
          accessibilityState={{
            disabled: !password
          }}
          style={styles.validateButton}
        >
          <ThemedText type="default" themeColor="white" style={{ flex: 1, textAlign: 'center' }}>
            Valider
          </ThemedText>
        </Pressable>
      </View>

      <View style={styles.textContainer}>
        <ThemedText type="subtitle" themeColor="white">
          Monitorfield
        </ThemedText>
        <ThemedText type="default" themeColor="white">
          version de test
        </ThemedText>
      </View>
    </SafeAreaView>
  )
}

const createStyles = theme =>
  StyleSheet.create({
    algaeIcon: {
      height: ICON_SIZE,
      marginTop: 50,
      width: ICON_SIZE
    },
    buttonsWrapper: {
      alignItems: 'center',
      flexDirection: 'column',
      gap: Spacing.five,
      marginHorizontal: 55
    },
    container: {
      alignItems: 'center',
      backgroundColor: theme.gunMetal,
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'space-between'
    },
    textContainer: {
      alignItems: 'center',
      flexDirection: 'column'
    },
    validateButton: {
      alignItems: 'center',
      backgroundColor: theme.blueGray,
      flexDirection: 'row',
      height: 48
    }
  })
