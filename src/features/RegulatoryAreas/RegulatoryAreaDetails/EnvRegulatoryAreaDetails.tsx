import { ThemedText } from '@components/Elements/Text'
import { Linking, View } from 'react-native'
import { styles } from './style'
import { useTheme } from '@hooks/use-theme'
import type { EnvRegulatoryArea } from '@/types/regulatoryAreasTypes'
import { Spacing } from '@constants/theme'
import { getRegulatoryAreaLabel } from '../utils/getRegulatoryAreaLabel'
import daysjs from 'dayjs'
import { useCallback } from 'react'
import { CloseButton } from '@components/Buttons/CloseButton'

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
  const labelStyle = {
    color: theme.textSecondary,
    marginTop: Spacing.three
  }

  const goToLegicem = useCallback(async (url: string) => {
    const supported = await Linking.canOpenURL(url)

    if (supported) {
      await Linking.openURL(url)
    } else {
      // oxlint-disable-next-line no-console
      console.warn(`Don't know how to open this URL: ${url}`)
    }
  }, [])

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
        <CloseButton onClose={onDismiss} />
      </View>
      <View style={styles.content}>
        {regulatoryArea.edition && (
          <ThemedText type="small" style={[labelStyle, { fontStyle: 'italic' }]}>
            {`Dernière modification le ${daysjs(regulatoryArea.edition).format('DD/MM/YYYY')}`}
          </ThemedText>
        )}

        <ThemedText type="small" style={labelStyle}>
          Résumé
        </ThemedText>
        <ThemedText type="default">{regulatoryArea.resume}</ThemedText>
        <ThemedText type="small" style={labelStyle}>
          Ensemble reg.
        </ThemedText>
        <ThemedText type="default">{regulatoryArea.type}</ThemedText>
        <ThemedText type="small" style={labelStyle}>
          Thématiques
        </ThemedText>
        <ThemedText type="default">{regulatoryArea.themes}</ThemedText>
        {/* TODO Subthemes are sent in the same string as the themes. See how to resolve this issue. */}
        <ThemedText type="small" style={labelStyle}>
          Sous-thématiques
        </ThemedText>
        <ThemedText type="default">{regulatoryArea.themes}</ThemedText>
        {regulatoryArea.authorizationPeriods && (
          <>
            <View style={styles.labelWithCircle}>
              <View
                style={{
                  ...styles.circle,
                  backgroundColor: theme.mediumSeaGreen
                }}
              />
              <ThemedText type="small" style={{ ...labelStyle, marginTop: Spacing.two }}>
                Période d&apos;autorisation
              </ThemedText>
            </View>
            <ThemedText type="default">{regulatoryArea.authorizationPeriods}</ThemedText>
          </>
        )}
        {regulatoryArea.prohibitionPeriods && (
          <>
            <View style={styles.labelWithCircle}>
              <View style={{ ...styles.circle, backgroundColor: theme.maximumRed }} />
              <ThemedText type="small" style={{ ...labelStyle, marginTop: Spacing.two }}>
                Période d&apos;interdiction
              </ThemedText>
            </View>
            <ThemedText type="default">{regulatoryArea.prohibitionPeriods}</ThemedText>
          </>
        )}
        <View style={styles.border}>
          <ThemedText type="small" style={{ ...labelStyle, marginTop: Spacing.two }}>
            Résumé réglementaire sur Légicem
          </ThemedText>
          <ThemedText type="default">{regulatoryArea.refReg}</ThemedText>
          <ThemedText type="link" onPress={() => goToLegicem(regulatoryArea.url)}>
            {regulatoryArea.url}
          </ThemedText>
        </View>
      </View>
    </>
  )
}
