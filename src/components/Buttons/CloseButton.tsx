import { Spacing } from '@constants/theme'
import { Image } from 'expo-image'
import { Pressable, StyleSheet } from 'react-native'

export function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onClose} hitSlop={8}>
      <Image source={require('@assets/icons/close.svg')} style={styles.icon} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  icon: {
    height: Spacing.five,
    width: Spacing.five
  }
})
