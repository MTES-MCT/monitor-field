import { ThemedText } from '@components/Elements/Text'
import { View } from 'react-native'
import { useTheme } from '@hooks/use-theme'
import type { FishRegulatoryArea } from '@/types/regulatoryAreasTypes'
import { Spacing } from '@constants/theme'
import { getRegulatoryAreaLabel } from '../utils/getRegulatoryAreaLabel'
import { styles } from './style'
import { CloseButton } from '@components/Buttons/CloseButton'

export function FishRegulatoryAreaDetails({
  color,
  regulatoryArea,
  onDismiss
}: {
  color: string
  regulatoryArea: FishRegulatoryArea
  onDismiss: () => void
}) {
  const theme = useTheme()
  const labelStyle = {
    color: theme.textSecondary,
    marginTop: Spacing.three
  }

  return (
    <>
      <View style={styles.titleWrapper}>
        <View style={styles.title}>
          <View
            style={{
              ...styles.square,
              backgroundColor: color,
              borderColor: theme.lightGray
            }}
          />
          <ThemedText type="default" style={styles.titleText}>
            {getRegulatoryAreaLabel(regulatoryArea, 'MONITORFISH')}
          </ThemedText>
        </View>
        <CloseButton onClose={onDismiss} />
      </View>
      <View style={styles.content}>
        <ThemedText type="small" style={labelStyle}>
          Thématique(s)
        </ThemedText>
        <ThemedText type="default">{regulatoryArea.theme}</ThemedText>
        <ThemedText type="small" style={labelStyle}>
          Type
        </ThemedText>
        <ThemedText type="default">{regulatoryArea.type}</ThemedText>
        <ThemedText type="small" style={labelStyle}>
          Zone
        </ThemedText>
        <ThemedText type="default">{regulatoryArea.zone}</ThemedText>
      </View>
    </>
  )
}
