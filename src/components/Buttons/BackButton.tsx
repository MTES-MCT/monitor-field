import { Image } from 'expo-image'
import { Pressable, StyleSheet } from 'react-native'

export const BackButton = ({ onBack }: { onBack: () => void }) => {
  return (
    <Pressable onPress={onBack} hitSlop={8}>
      <Image source={require('@assets/icons/chevron.svg')} style={styles.icon} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  icon: {
    height: 20,
    width: 20
  }
})
