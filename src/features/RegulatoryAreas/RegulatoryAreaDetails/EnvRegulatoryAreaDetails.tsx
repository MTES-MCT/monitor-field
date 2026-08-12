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
import { Image } from 'expo-image'

const cacemTel = process.env.EXPO_PUBLIC_CACEM_NUMBER

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

  const goToLegicem = useCallback(async (url: string) => {
    const supported = await Linking.canOpenURL(url)

    if (supported) {
      await Linking.openURL(url)
    } else {
      // oxlint-disable-next-line no-console
      console.warn(`Don't know how to open this URL: ${url}`)
    }
  }, [])

  const callCacem = useCallback(() => {
    Linking.openURL(`tel:${cacemTel}`)
  }, [])

  return (
    <>
      <View style={styles.titleWrapper}>
        <View style={{ alignItems: 'center', flex: 1 }}>
          <ThemedText
            type="default"
            style={styles.titleText}
          >{`${regulatoryArea.layerName} - ${regulatoryArea.location}`}</ThemedText>
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
        </View>
        <CloseButton onClose={onDismiss} />
      </View>
      <View style={styles.content}>
        {regulatoryArea.edition && (
          <ThemedText type="small" style={[styles.labelStyle, { fontStyle: 'italic' }]}>
            {`Dernière modification de la reg le ${daysjs(regulatoryArea.edition).format('DD/MM/YYYY')}`}
          </ThemedText>
        )}

        <ThemedText type="small" style={styles.labelStyle}>
          Résumé
        </ThemedText>
        <ThemedText type="default" style={styles.horizontalPadding}>
          {regulatoryArea.resume}
        </ThemedText>
        <ThemedText type="small" style={styles.labelStyle}>
          Ensemble reg.
        </ThemedText>
        <ThemedText type="default" style={styles.horizontalPadding}>
          {regulatoryArea.type}
        </ThemedText>
        <ThemedText type="small" style={styles.labelStyle}>
          Thématiques
        </ThemedText>
        <ThemedText type="default" style={styles.horizontalPadding}>
          {regulatoryArea.themes}
        </ThemedText>
        {/* TODO Subthemes are sent in the same string as the themes. See how to resolve this issue. */}
        <ThemedText type="small" style={styles.labelStyle}>
          Sous-thématiques
        </ThemedText>
        <ThemedText type="default" style={styles.horizontalPadding}>
          {regulatoryArea.themes}
        </ThemedText>
        {regulatoryArea.authorizationPeriods && (
          <>
            <View style={styles.separator} />
            <View style={styles.labelWithCircle}>
              <View
                style={{
                  ...styles.circle,
                  backgroundColor: theme.mediumSeaGreen
                }}
              />
              <ThemedText type="small" themeColor="slateGray">
                Période d&apos;autorisation
              </ThemedText>
            </View>
            <ThemedText type="default" style={styles.horizontalPadding}>
              tiutoriu{regulatoryArea.authorizationPeriods}
            </ThemedText>
          </>
        )}

        {regulatoryArea.prohibitionPeriods && (
          <>
            <View style={styles.separator} />
            <View style={styles.labelWithCircle}>
              <View style={{ ...styles.circle, backgroundColor: theme.maximumRed }} />
              <ThemedText type="small" themeColor="slateGray">
                Période d&apos;interdiction
              </ThemedText>
            </View>
            <ThemedText type="default" style={styles.horizontalPadding}>
              fsdgfsdgf {regulatoryArea.prohibitionPeriods}
            </ThemedText>
          </>
        )}
        <View style={styles.separator} />
        <View>
          <ThemedText type="small" style={{ ...styles.labelStyle, marginTop: Spacing.two }}>
            Résumé réglementaire sur Légicem
          </ThemedText>
          <ThemedText type="default" style={styles.horizontalPadding}>
            {regulatoryArea.refReg}
          </ThemedText>
          <ThemedText type="link" style={styles.horizontalPadding} onPress={() => goToLegicem(regulatoryArea.url)}>
            {regulatoryArea.url}
          </ThemedText>
        </View>
        <View style={styles.separator} />
        <View style={[styles.horizontalPadding, { alignItems: 'center', flexDirection: 'row', gap: Spacing.two }]}>
          <Image
            source={require('@assets/icons/info.svg')}
            tintColor={theme.slateGray}
            style={{ height: 20, width: 20 }}
          />
          <ThemedText type="small">
            Pour plus d’informations, {' \n'}appeler le CACEM au{' '}
            <ThemedText type="link" onPress={callCacem} style={{ textDecorationLine: 'underline' }}>
              {cacemTel}
            </ThemedText>
          </ThemedText>
        </View>
      </View>
    </>
  )
}
