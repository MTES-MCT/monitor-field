import { useGlobalStyle } from '@globalStyle'
import { Image } from 'expo-image'
import { Pressable } from 'react-native'

export function CloseButton({
  onClose,
  isSmall = false,
  style
}: {
  onClose: () => void
  isSmall?: boolean
  style?: any
}) {
  const globalStyle = useGlobalStyle()
  return (
    <Pressable accessibilityRole="button" onPress={onClose} hitSlop={18} style={style}>
      <Image
        source={require('@assets/icons/close.svg')}
        style={isSmall ? globalStyle.iconSmall : globalStyle.iconNormal}
      />
    </Pressable>
  )
}
