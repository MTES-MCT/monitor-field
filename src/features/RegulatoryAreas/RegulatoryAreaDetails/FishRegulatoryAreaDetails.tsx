import { ThemedText } from '@components/Elements/Text'
import { Linking, View } from 'react-native'
import { useTheme } from '@hooks/use-theme'
import type { FishRegulatoryArea } from '@/types/regulatoryAreasTypes'
import { getRegulatoryAreaLabel } from '../utils/getRegulatoryAreaLabel'
import { styles } from './style'
import { CloseButton } from '@components/Buttons/CloseButton'
import { Image } from 'expo-image'
import { Spacing } from '@constants/theme'
import { useCallback } from 'react'
import { logToSentry } from '@utils/sentryLogger'
import { useGlobalStyle } from '@globalStyle'

const CNSP_TEL_NUMBER = process.env.EXPO_PUBLIC_CNSP_NUMBER

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
  const globalStyle = useGlobalStyle()

  const callCnsp = useCallback(async () => {
    const supported = await Linking.canOpenURL(`tel:${CNSP_TEL_NUMBER}`)
    if (supported) {
      Linking.openURL(`tel:${CNSP_TEL_NUMBER}`)
    } else {
      logToSentry(`Don't know how to open this URL: tel:${CNSP_TEL_NUMBER}`, 'info', {
        extra: { label: 'FishRegulatoryAreaDetails' }
      })
    }
  }, [])

  return (
    <>
      <View style={styles.titleWrapper}>
        <View style={styles.title}>
          <View style={[styles.square, { backgroundColor: color, borderColor: theme.lightGray }]} />
          <ThemedText type="default" style={styles.titleText}>
            {getRegulatoryAreaLabel(regulatoryArea, 'MONITORFISH')}
          </ThemedText>
        </View>
        <CloseButton onClose={onDismiss} />
      </View>
      <View style={styles.content}>
        <ThemedText type="small" style={styles.labelStyle}>
          Thématique(s)
        </ThemedText>
        <ThemedText type="default" style={styles.horizontalPadding}>
          {regulatoryArea.theme}
        </ThemedText>
        <ThemedText type="small" style={styles.labelStyle}>
          Type
        </ThemedText>
        <ThemedText type="default" style={styles.horizontalPadding}>
          {regulatoryArea.type}
        </ThemedText>
        <ThemedText type="small" style={styles.labelStyle}>
          Zone
        </ThemedText>
        <ThemedText type="default" style={styles.horizontalPadding}>
          {regulatoryArea.zone}
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
