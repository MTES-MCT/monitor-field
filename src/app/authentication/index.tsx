import { usePathname } from 'expo-router'
import { Text } from 'react-native'

export default function Authentication() {
  const pathname = usePathname()

  return <Text>{pathname}</Text>
}
