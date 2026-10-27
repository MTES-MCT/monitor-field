import { Linking, Text, View } from 'react-native'

import { ProConnectButton } from '@features/Authentication/components/ProConnectButton'
import { useProConnectAuth } from '@features/Authentication/hooks/useProConnectAuth'

const ERROR_MESSAGES = {
  auth_failed: 'La connexion a échoué. Veuillez réessayer.',
  unauthorized: "Votre compte n'est pas autorisé à accéder à l'application. Contactez l'équipe."
}

export default function Authentication() {
  const { error, isReady, signIn } = useProConnectAuth()

  return (
    <View style={{ flex: 1, gap: 16, justifyContent: 'center', padding: 24 }}>
      {error && <Text>{ERROR_MESSAGES[error]}</Text>}
      <ProConnectButton disabled={!isReady} onPress={signIn} />
      <Text
        accessibilityRole="link"
        onPress={() => Linking.openURL('https://www.proconnect.gouv.fr/')}
        style={{ color: '#000091', textAlign: 'center', textDecorationLine: 'underline' }}
      >
        Qu’est-ce que ProConnect ?
      </Text>
    </View>
  )
}
