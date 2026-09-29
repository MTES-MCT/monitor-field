import { ThemedText } from '@components/Elements/Text'
import { useTheme } from '@hooks/use-theme'
import { View } from 'react-native'
import { styles } from '../style'

export type RegulationStatus = 'authorized' | 'forbidden'

export function SectionTitle({ children, status }: { children: string; status?: RegulationStatus }) {
  const theme = useTheme()

  return (
    <View style={styles.labelWithCircle}>
      {!!status && (
        <View
          style={[
            styles.circle,
            { backgroundColor: status === 'authorized' ? theme.mediumSeaGreen : theme.maximumRed }
          ]}
        />
      )}
      <ThemedText type="small" themeColor="slateGray">
        {children}
      </ThemedText>
    </View>
  )
}
