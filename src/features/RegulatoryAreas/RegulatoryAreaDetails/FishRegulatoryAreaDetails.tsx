import { ThemedText } from '@components/Elements/Text'
import { View } from 'react-native'
import { useTheme } from '@hooks/use-theme'
import type { FishRegulatoryAreaSummary } from '@domain/entities/regulatoryAreas/RegulatoryAreaSummary'
import { getRegulatoryAreaLabel } from '../utils/getRegulatoryAreaLabel'
import { styles } from './style'
import { CloseButton } from '@components/Buttons/CloseButton'
import { Image } from 'expo-image'
import { Spacing } from '@constants/theme'
import { useCallback } from 'react'
import { logToSentry } from '@utils/sentryLogger'
import { useGlobalStyle } from '@globalStyle'
import * as Linking from 'expo-linking'

const CNSP_TEL_NUMBER = process.env.EXPO_PUBLIC_CNSP_NUMBER

export function FishRegulatoryAreaDetails({
  color,
  regulatoryArea,
  onDismiss
}: {
  color: string
  regulatoryArea: FishRegulatoryAreaSummary
  onDismiss: () => void
}) {
  const theme = useTheme()
  const globalStyle = useGlobalStyle()

  const callCnsp = useCallback(async () => {
    const url = `tel:${CNSP_TEL_NUMBER}`

    try {
      await Linking.openURL(url)
    } catch (error) {
      logToSentry(`Failed to open URL: ${url}`, 'error', {
        extra: {
          error,
          label: 'FishRegulatoryAreaDetails'
        }
      })
    }
  }, [])

  return (
    <>
      <View style={styles.titleWrapper}>
        <View style={{ flex: 1 }}>
          <ThemedText type="small" style={styles.titleText}>
            {regulatoryArea.theme}
          </ThemedText>
          <View style={styles.title}>
            <View style={[styles.square, { backgroundColor: color, borderColor: theme.lightGray }]} />
            <ThemedText type="default" style={styles.titleText}>
              {getRegulatoryAreaLabel(regulatoryArea, 'MONITORFISH')}
            </ThemedText>
          </View>
        </View>
        <CloseButton onClose={onDismiss} />
      </View>
      <View style={styles.content}>
        <ThemedText type="small" style={styles.labelStyle}>
          Ensemble reg.
        </ThemedText>
        <ThemedText type="default" style={styles.horizontalPadding}>
          {regulatoryArea.type}
        </ThemedText>

        <View style={globalStyle.separator} />

        <View style={[styles.horizontalPadding, { alignItems: 'center', flexDirection: 'row', gap: Spacing.two }]}>
          <Image
            source={require('@assets/icons/info.svg')}
            tintColor={theme.slateGray}
            style={{ height: 20, width: 20 }}
          />
          <ThemedText type="small">
            Pour plus d’informations, {' \n'}appeler le CNSP au{' '}
            <ThemedText type="link" onPress={callCnsp} style={globalStyle.textUnderline}>
              {CNSP_TEL_NUMBER}
            </ThemedText>
          </ThemedText>
        </View>
      </View>
    </>
  )
}
