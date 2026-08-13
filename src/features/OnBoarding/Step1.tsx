import { ThemedText } from '@components/Elements/Text'
import { Pressable, StyleSheet, View } from 'react-native'
import { useTheme } from '@hooks/use-theme'
import { Image } from 'expo-image'
import { Spacing } from '@constants/theme'

export function Step1({ setCurrentStep }: { setCurrentStep: () => void }) {
  const theme = useTheme()
  const MONITOR_EMAIL = process.env.EXPO_PUBLIC_EMAIL

  return (
    <View style={styles.wrapper}>
      <ThemedText themeColor="white" type="title" style={styles.title}>
        Bienvenue dans MonitorField !
      </ThemedText>
      <ThemedText themeColor="white" type="default" style={styles.text}>
        Merci pour votre participation {'\n'} aux tests de cette application.
      </ThemedText>
      <ThemedText themeColor="white" type="default" style={styles.text}>
        Une{' '}
        <ThemedText themeColor="white" type="defaultBold">
          question
        </ThemedText>
        , un{' '}
        <ThemedText themeColor="white" type="defaultBold">
          problème
        </ThemedText>{' '}
        {'\n'} ou des{' '}
        <ThemedText themeColor="white" type="defaultBold">
          suggestions
        </ThemedText>{' '}
        ?
      </ThemedText>
      <ThemedText themeColor="white" type="default" style={styles.text}>
        ...dites-le nous à cette adresse : {'\n'}{' '}
        <ThemedText themeColor="white" style={styles.textUnderline} type="default">
          {MONITOR_EMAIL}
        </ThemedText>
      </ThemedText>
      <ThemedText themeColor="white" type="default" style={styles.text}>
        ...ou à tout moment dans l’application {'\n'} à l’aide du bouton suivant :
      </ThemedText>
      <View style={[styles.messageWrapper, { backgroundColor: theme.white }]}>
        <Image source={require('@assets/icons/message.svg')} style={styles.messageIcon} />
      </View>
      <ThemedText themeColor="white" type="defaultItalic" style={[styles.text, styles.verticalMargin]}>
        (Retrouvez l’adresse de contact {'\n'} dans le menu paramètres)
      </ThemedText>

      <Pressable onPress={setCurrentStep} style={[styles.button, { backgroundColor: theme.blueGray }]}>
        <ThemedText type="default" themeColor="white">
          Suivant
        </ThemedText>
        <Image source={require('@assets/icons/arrow-right.svg')} style={styles.arrowIcon} />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  arrowIcon: {
    height: 24,
    width: 24
  },
  button: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.two,
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: Spacing.six
  },
  messageIcon: {
    height: 26,
    width: 26
  },
  messageWrapper: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    width: 48
  },
  text: {
    textAlign: 'center'
  },
  textUnderline: {
    textDecorationLine: 'underline'
  },
  title: {
    marginBottom: Spacing.four,
    textAlign: 'center'
  },
  verticalMargin: {
    marginVertical: Spacing.six
  },
  wrapper: {
    alignItems: 'center',
    flex: 1,
    gap: Spacing.four,
    justifyContent: 'center',
    padding: Spacing.six,
    textAlign: 'center'
  }
})
