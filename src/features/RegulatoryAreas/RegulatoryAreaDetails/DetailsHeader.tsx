import { CloseButton } from '@components/Buttons/CloseButton'
import { HighlightedText } from '@components/Elements/HighlightedText'
import { useTheme } from '@hooks/use-theme'
import { View } from 'react-native'
import { styles } from './style'

export function DetailsHeader({
  color,
  numberOfLines,
  onDismiss,
  searchQuery,
  subtitle,
  title
}: {
  color: string
  numberOfLines?: number
  onDismiss: () => void
  searchQuery?: string
  subtitle: string
  title: string
}) {
  const theme = useTheme()

  return (
    <View style={styles.titleWrapper}>
      <View style={{ flex: 1 }}>
        <HighlightedText type="small" style={styles.titleText} searchQuery={searchQuery}>
          {subtitle}
        </HighlightedText>
        <View style={styles.title}>
          <View style={[styles.square, { backgroundColor: color, borderColor: theme.lightGray }]} />
          <HighlightedText
            type="default"
            style={styles.titleText}
            numberOfLines={numberOfLines}
            searchQuery={searchQuery}
          >
            {title}
          </HighlightedText>
        </View>
      </View>
      <CloseButton onClose={onDismiss} />
    </View>
  )
}
