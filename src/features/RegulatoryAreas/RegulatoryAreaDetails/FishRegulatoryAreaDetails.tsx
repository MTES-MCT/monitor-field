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

const cnspTel = process.env.EXPO_PUBLIC_CNSP_NUMBER

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

  const callCnsp = useCallback(() => {
    Linking.openURL(`tel:${cnspTel}`)
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
        <View style={styles.separator} />

        <View style={[styles.horizontalPadding, { alignItems: 'center', flexDirection: 'row', gap: Spacing.two }]}>
          <Image
            source={require('@assets/icons/info.svg')}
            tintColor={theme.slateGray}
            style={{ height: 20, width: 20 }}
          />
          <ThemedText type="small">
            Pour plus d’informations, {' \n'}appeler le CNSP au{' '}
            <ThemedText type="link" onPress={callCnsp} style={{ textDecorationLine: 'underline' }}>
              {cnspTel}
            </ThemedText>
          </ThemedText>
        </View>
      </View>
    </>
  )
}
