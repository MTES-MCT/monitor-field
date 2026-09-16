import { ThemedText } from '@components/Elements/Text'
import { Spacing } from '@constants/theme'
import { useTheme } from '@hooks/use-theme'
import { Pressable, StyleSheet, View } from 'react-native'

type RadioButtonProps = {
  label: string
  isSelected: boolean
  onPress: () => void
  disabled?: boolean
}

export function RadioButton({ label, isSelected, onPress, disabled = false }: RadioButtonProps) {
  const theme = useTheme()

  const ringColor = isSelected ? theme.gunMetal : theme.lightGray

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected, disabled }}
      disabled={disabled}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          opacity: disabled ? 0.55 : pressed ? 0.85 : 1
        }
      ]}
    >
      <View
        style={{
          borderColor: theme.slateGray
        }}
      >
        <View style={[styles.innerCircle, { backgroundColor: theme.gainsboro, borderColor: ringColor }]}>
          {isSelected && <View style={[styles.dot, { backgroundColor: theme.gunMetal }]} />}
        </View>
      </View>

      <ThemedText style={styles.label} themeColor="gunMetal" type="default">
        {label}
      </ThemedText>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  dot: {
    borderRadius: 6,
    height: 12,
    width: 12
  },
  innerCircle: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    height: 24,
    justifyContent: 'center',
    width: 24
  },
  label: {
    flexShrink: 1
  },
  outerCircle: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.two,
    height: 48
  }
})
