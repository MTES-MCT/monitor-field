import { ThemedText } from '@components/Text'
import { Pressable, StyleSheet, View } from 'react-native'
import { useTheme } from '@hooks/use-theme'
import { Spacing } from '@constants/theme'
import { Image } from 'expo-image'

type MultiCheckboxProps = {
  label: string
  isChecked: boolean
  onToggle: () => void
}

export function MultiCheckbox({ label, isChecked, onToggle }: MultiCheckboxProps) {
  const theme = useTheme()

  return (
    <Pressable style={styles.row} onPress={onToggle} hitSlop={8}>
      <View style={[styles.checkbox, { backgroundColor: isChecked ? theme.blueGray : theme.white }]}>
        {isChecked && <Image source={require('../../assets/icons/check.svg')} style={styles.checkIcon} />}
      </View>

      <ThemedText themeColor="white" type="default">
        {label}
      </ThemedText>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  checkIcon: {
    height: 16,
    width: 16
  },
  checkbox: {
    alignItems: 'center',
    height: 18,
    justifyContent: 'center',
    width: 18
  },
  row: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: Spacing.two,
    paddingVertical: Spacing.two
  }
})
