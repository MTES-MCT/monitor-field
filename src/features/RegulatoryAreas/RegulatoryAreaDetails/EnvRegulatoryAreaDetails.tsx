import { ThemedText } from '@components/Elements/Text'
import { View } from 'react-native'
import { styles } from './style'
import { useTheme } from '@hooks/use-theme'
import type { EnvRegulatoryAreaSummary } from '@domain/entities/regulatoryAreas/RegulatoryAreaSummary'
import { Spacing } from '@constants/theme'
import { getRegulatoryAreaLabel } from '../utils/getRegulatoryAreaLabel'
import daysjs from 'dayjs'
import { useCallback, useMemo } from 'react'
import { CloseButton } from '@components/Buttons/CloseButton'
import { Image } from 'expo-image'
import { logToSentry } from '@utils/sentryLogger'
import { useGlobalStyle } from '@globalStyle'
import * as Linking from 'expo-linking'

const CACEM_TEL_NUMBER = process.env.EXPO_PUBLIC_CACEM_NUMBER

export function EnvRegulatoryAreaDetails({
  color,
  regulatoryArea,
  onDismiss
}: {
  color: string
  regulatoryArea: EnvRegulatoryAreaSummary
  onDismiss: () => void
}) {
  const theme = useTheme()
  const globalStyle = useGlobalStyle()

  const goToLegicem = useCallback(async (url: string) => {
    const supported = await Linking.canOpenURL(url)

    if (supported) {
      await Linking.openURL(url)
    } else {
      logToSentry(`Don't know how to open this URL: ${url}`, 'info', {
        extra: { label: 'EnvRegulatoryAreaDetails' }
      })
    }
  }, [])
  const callCacem = useCallback(async () => {
    const url = `tel:${CACEM_TEL_NUMBER}`

    try {
      await Linking.openURL(url)
    } catch (error) {
      logToSentry(`Failed to open URL: ${url}`, 'error', {
        extra: {
          error,
          label: 'EnvRegulatoryAreaDetails'
        }
      })
    }
  }, [])

  const groupTitle = useMemo(() => {
    if (!regulatoryArea || !regulatoryArea.layerName) {
      return ''
    }

    return `${regulatoryArea.layerName} ${!!regulatoryArea.location ? `- ${regulatoryArea.location}` : ''}`
  }, [regulatoryArea])

  if (!regulatoryArea) {
    return null
  }

  return (
    <>
      <View style={styles.titleWrapper}>
        <View style={{ flex: 1 }}>
          <ThemedText type="small" style={styles.titleText}>
            {groupTitle}
          </ThemedText>
          <View style={styles.title}>
            <View style={[styles.square, { backgroundColor: color, borderColor: theme.lightGray }]} />
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
        {regulatoryArea.themes && (
          <>
            <ThemedText type="small" style={styles.labelStyle}>
              Thématiques
            </ThemedText>
            <ThemedText type="default" style={styles.horizontalPadding}>
              {regulatoryArea.themes}
            </ThemedText>
          </>
        )}
        {/* TODO Subthemes are sent in the same string as the themes. See how to resolve this issue. */}
        {regulatoryArea.themes && (
          <>
            <ThemedText type="small" style={styles.labelStyle}>
              Sous-thématiques
            </ThemedText>
            <ThemedText type="default" style={styles.horizontalPadding}>
              {regulatoryArea.themes}
            </ThemedText>
          </>
        )}
        {regulatoryArea.authorizationPeriods && (
          <>
            <View style={globalStyle.separator} />
            <View style={styles.labelWithCircle}>
              <View style={[styles.circle, { backgroundColor: theme.mediumSeaGreen }]} />
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
            <View style={globalStyle.separator} />
            <View style={styles.labelWithCircle}>
              <View style={[styles.circle, { backgroundColor: theme.maximumRed }]} />
              <ThemedText type="small" themeColor="slateGray">
                Période d&apos;interdiction
              </ThemedText>
            </View>
            <ThemedText type="default" style={styles.horizontalPadding}>
              fsdgfsdgf {regulatoryArea.prohibitionPeriods}
            </ThemedText>
          </>
        )}
        <View style={globalStyle.separator} />
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
        <View style={globalStyle.separator} />
        <View style={[styles.horizontalPadding, { alignItems: 'center', flexDirection: 'row', gap: Spacing.two }]}>
          <Image source={require('@assets/icons/info.svg')} tintColor={theme.slateGray} style={globalStyle.iconSmall} />
          <ThemedText type="small">
            Pour plus d’informations, {' \n'}appeler le CACEM au{' '}
            <ThemedText type="link" onPress={callCacem} style={globalStyle.textUnderline}>
              {CACEM_TEL_NUMBER}
            </ThemedText>
          </ThemedText>
        </View>
      </View>
    </>
  )
}
