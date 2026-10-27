import { Button, View } from 'react-native'

import { useProConnectAuth } from '@features/Authentication/useProConnectAuth'

export default function Authentication() {
  const { isReady, signIn } = useProConnectAuth()

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
      <Button disabled={!isReady} onPress={signIn} title="Se connecter avec ProConnect" />
    </View>
  )
}
