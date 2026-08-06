import { ThemedText } from '@components/Text'
import { Image } from 'expo-image'
import { Pressable, View } from 'react-native'
import { styles } from './style'
import { useTheme } from '@hooks/use-theme'
import type { EnvRegulatoryArea } from '@/types/regulatoryAreasTypes'
import { Spacing } from '@constants/theme'
import { getRegulatoryAreaLabel } from '../utils/getRegulatoryAreaLabel'

export function EnvRegulatoryAreaDetails({
  color,
  regulatoryArea,
  onDismiss
}: {
  color: string
  regulatoryArea: EnvRegulatoryArea
  onDismiss: () => void
}) {
  const theme = useTheme()
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
            {getRegulatoryAreaLabel(regulatoryArea, 'MONITORENV')}
          </ThemedText>
        </View>
        <Pressable accessibilityRole="button" onPress={onDismiss}>
          <Image source={require('../../../../assets/icons/close.svg')} style={styles.icon} />
        </Pressable>
      </View>
      <View style={styles.content}>
        <ThemedText type="default" style={{ color: theme.textSecondary, marginTop: Spacing.three }}>
          Dernière modification le XX/XX/XXXX
        </ThemedText>
        <ThemedText type="default" style={{ color: theme.textSecondary, marginTop: Spacing.three }}>
          Résumé
        </ThemedText>
        <ThemedText type="default">{regulatoryArea.resume}</ThemedText>
        <ThemedText type="default" style={{ color: theme.textSecondary, marginTop: Spacing.three }}>
          Ensemble reg.
        </ThemedText>
        <ThemedText type="default">{regulatoryArea.type}</ThemedText>
        <ThemedText type="default" style={{ color: theme.textSecondary, marginTop: Spacing.three }}>
          Thématiques
        </ThemedText>
        <ThemedText type="default">{regulatoryArea.themes}</ThemedText>
        {/* TODO Subthemes are sent in the same string as the themes. See how to resolve this issue. */}
        <ThemedText type="default" style={{ color: theme.textSecondary, marginTop: Spacing.three }}>
          Sous-thématiques
        </ThemedText>
        <ThemedText type="default">{regulatoryArea.themes}</ThemedText>
        <ThemedText type="default" style={{ color: theme.textSecondary, marginTop: Spacing.three }}>
          Période d&apos;autorisation
        </ThemedText>
        <ThemedText type="default">{regulatoryArea.authorizationPeriods}</ThemedText>
        <ThemedText type="default" style={{ color: theme.textSecondary, marginTop: Spacing.three }}>
          Période d&apos;interdiction
        </ThemedText>
        <ThemedText type="default">{regulatoryArea.prohibitionPeriods}</ThemedText>
        <ThemedText type="default" style={{ color: theme.textSecondary, marginTop: Spacing.three }}>
          Résumé réglementaire sur Légicem
        </ThemedText>
        <ThemedText type="default">{regulatoryArea.refReg}</ThemedText>
      </View>
    </>
  )
}
