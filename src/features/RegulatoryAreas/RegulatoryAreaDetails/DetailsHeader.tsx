import { CloseButton } from '@components/Buttons/CloseButton'
import { ThemedText } from '@components/Elements/Text'
import { useTheme } from '@hooks/use-theme'
import { View } from 'react-native'
import { styles } from './style'

export function DetailsHeader({
  color,
  numberOfLines,
  onDismiss,
  subtitle,
  title
}: {
  color: string
  numberOfLines?: number
  onDismiss: () => void
  subtitle: string
  title: string
}) {
  const theme = useTheme()

  return (
    <View style={styles.titleWrapper}>
      <View style={{ flex: 1 }}>
        <ThemedText type="small" style={styles.titleText}>
          {subtitle}
        </ThemedText>
        <View style={styles.title}>
          <View style={[styles.square, { backgroundColor: color, borderColor: theme.lightGray }]} />
          <ThemedText type="default" style={styles.titleText} numberOfLines={numberOfLines}>
            {title}
          </ThemedText>
        </View>
      </View>
      <CloseButton onClose={onDismiss} />
    </View>
  )
}
