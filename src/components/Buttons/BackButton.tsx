import { useGlobalStyle } from '@globalStyle'
import { Image } from 'expo-image'
import { Pressable } from 'react-native'

export const BackButton = ({ onBack }: { onBack: () => void }) => {
  const globalStyle = useGlobalStyle()

  return (
    <Pressable onPress={onBack} hitSlop={8}>
      <Image source={require('@assets/icons/chevron.svg')} style={globalStyle.iconSmall} />
    </Pressable>
  )
}
