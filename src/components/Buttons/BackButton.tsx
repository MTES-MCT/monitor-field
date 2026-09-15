import { useGlobalStyle } from '@globalStyle'
import { Image } from 'expo-image'
import { Pressable } from 'react-native'

export const BackButton = ({ onBack, style }: { onBack: () => void; style?: any }) => {
  const globalStyle = useGlobalStyle()

  return (
    <Pressable onPress={onBack} hitSlop={18} style={style}>
      <Image source={require('@assets/icons/chevron.svg')} style={globalStyle.iconSmall} />
    </Pressable>
  )
}
