import { ThemedText } from '@components/Elements/Text'
import { Pressable, StyleSheet, View } from 'react-native'
import { useTheme } from '@hooks/use-theme'
import { Spacing, type Accent } from '@constants/theme'
import { Image } from 'expo-image'

type MultiCheckboxProps = {
  accent?: Accent
  label: string
  isChecked: boolean
  onToggle: () => void
}

export function MultiCheckbox({ accent = 'PRIMARY', label, isChecked, onToggle }: MultiCheckboxProps) {
  const theme = useTheme()

  const backgroundColor = isChecked ? theme[accent === 'PRIMARY' ? 'charcoal' : 'blueGray'] : theme.gainsboro

  return (
    <Pressable style={styles.row} onPress={onToggle} hitSlop={8}>
      <View style={[styles.checkbox, { backgroundColor, borderColor: theme.lightGray }]}>
        {isChecked && <Image source={require('@assets/icons/check.svg')} style={styles.checkIcon} />}
      </View>

      <ThemedText themeColor={accent === 'PRIMARY' ? 'gunMetal' : 'white'} type="default">
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
    borderWidth: 1,
    height: 18,
    justifyContent: 'center',
    width: 18
  },
  row: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: Spacing.two,
    height: 48,
    paddingVertical: Spacing.two
  }
})
