import { ThemedText } from '@components/Elements/Text'
import { useTheme } from '@hooks/use-theme'
import { View } from 'react-native'
import { styles } from '../style'

export function SectionTitle({ authorized, children }: { authorized?: boolean; children: string }) {
  const theme = useTheme()

  return (
    <View style={styles.labelWithCircle}>
      {authorized !== undefined && (
        <View style={[styles.circle, { backgroundColor: authorized ? theme.mediumSeaGreen : theme.maximumRed }]} />
      )}
      <ThemedText type="small" themeColor="slateGray">
        {children}
      </ThemedText>
    </View>
  )
}
