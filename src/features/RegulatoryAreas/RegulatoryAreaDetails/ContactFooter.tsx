import { ThemedText } from '@components/Elements/Text'
import { useGlobalStyle } from '@globalStyle'
import { useTheme } from '@hooks/use-theme'
import useMatomo from '@matomo/useMatomo'
import { logToSentry } from '@utils/sentryLogger'
import { Image } from 'expo-image'
import * as Linking from 'expo-linking'
import { useCallback } from 'react'
import { View } from 'react-native'
import { styles } from './style'

export function ContactFooter({ phoneNumber, serviceName }: { phoneNumber: string | undefined; serviceName: string }) {
  const theme = useTheme()
  const globalStyle = useGlobalStyle()
  const { trackEvent } = useMatomo()

  const call = useCallback(async () => {
    const url = `tel:${phoneNumber}`

    try {
      await Linking.openURL(url)
      trackEvent({
        action: `Appel ${serviceName}`,
        category: 'Support',
        name: `Appel ${serviceName} depuis une zone réglementaire`
      })
    } catch (error) {
      logToSentry(`Failed to open URL: ${url}`, 'error', { extra: { error, label: 'ContactFooter' } })
    }
  }, [phoneNumber, serviceName, trackEvent])

  return (
    <>
      <View style={globalStyle.separator} />
      <View style={[styles.horizontalPadding, styles.contact]}>
        <Image source={require('@assets/icons/info.svg')} tintColor={theme.slateGray} style={globalStyle.iconSmall} />
        <ThemedText type="small">
          Pour plus d’informations, {' \n'}appeler le {serviceName} au{' '}
          <ThemedText type="link" onPress={call} style={globalStyle.textUnderline}>
            {phoneNumber}
          </ThemedText>
        </ThemedText>
      </View>
    </>
  )
}
