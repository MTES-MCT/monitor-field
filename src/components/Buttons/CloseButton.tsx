import { useGlobalStyle } from '@globalStyle'
import { Image } from 'expo-image'
import { Pressable } from 'react-native'

export function CloseButton({ onClose, isSmall = false }: { onClose: () => void; isSmall?: boolean }) {
  const globalStyle = useGlobalStyle()
  return (
    <Pressable accessibilityRole="button" onPress={onClose} hitSlop={18}>
      <Image
        source={require('@assets/icons/close.svg')}
        style={isSmall ? globalStyle.iconSmall : globalStyle.iconNormal}
      />
    </Pressable>
  )
}
