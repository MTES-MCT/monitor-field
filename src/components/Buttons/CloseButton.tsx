import { useGlobalStyle } from '@globalStyle'
import { Image } from 'expo-image'
import { Pressable } from 'react-native'

export function CloseButton({ onClose }: { onClose: () => void }) {
  const globalStyle = useGlobalStyle()
  return (
    <Pressable accessibilityRole="button" onPress={onClose} hitSlop={8}>
      <Image source={require('@assets/icons/close.svg')} style={globalStyle.iconNormal} />
    </Pressable>
  )
}
