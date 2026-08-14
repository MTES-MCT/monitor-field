import { ThemedText } from '@components/Elements/Text'
import { Pressable, StyleSheet, View } from 'react-native'
import { useThemedStyles } from '@hooks/use-themed-styles'
import { Image } from 'expo-image'
import { Spacing } from '@constants/theme'
import { useGlobalStyle } from '@globalStyle'

const MONITOR_EMAIL = process.env.EXPO_PUBLIC_EMAIL

export function Step1({ setCurrentStep }: { setCurrentStep: () => void }) {
  const styles = useThemedStyles(createStyles)
  const globalStyle = useGlobalStyle()

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
        <ThemedText themeColor="white" style={globalStyle.textUnderline} type="default">
          {MONITOR_EMAIL}
        </ThemedText>
      </ThemedText>
      <ThemedText themeColor="white" type="default" style={styles.text}>
        ...ou à tout moment dans l’application {'\n'} à l’aide du bouton suivant :
      </ThemedText>
      <View style={styles.messageWrapper}>
        <Image source={require('@assets/icons/message.svg')} style={globalStyle.iconNormal} />
      </View>
      <ThemedText themeColor="white" type="defaultItalic" style={[styles.text, styles.verticalMargin]}>
        (Retrouvez l’adresse de contact {'\n'} dans le menu paramètres)
      </ThemedText>

      <Pressable onPress={setCurrentStep} style={styles.button}>
        <ThemedText type="default" themeColor="white">
          Suivant
        </ThemedText>
        <Image source={require('@assets/icons/arrow-right.svg')} style={globalStyle.iconNormal} />
      </Pressable>
    </View>
  )
}

const createStyles = theme =>
  StyleSheet.create({
    button: {
      alignItems: 'center',
      backgroundColor: theme.blueGray,
      flexDirection: 'row',
      gap: Spacing.two,
      height: 48,
      justifyContent: 'center',
      paddingHorizontal: Spacing.six
    },
    messageWrapper: {
      alignItems: 'center',
      backgroundColor: theme.white,
      height: 48,
      justifyContent: 'center',
      width: 48
    },
    text: {
      textAlign: 'center'
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
