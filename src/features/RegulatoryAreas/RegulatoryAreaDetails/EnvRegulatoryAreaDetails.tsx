import { ThemedText } from '@components/Elements/Text'
import { View } from 'react-native'
import { styles } from './style'
import { useTheme } from '@hooks/use-theme'
import type { EnvRegulatoryAreaSummary } from '@domain/entities/regulatoryAreas/RegulatoryAreaSummary'
import { Spacing } from '@constants/theme'
import { getRegulatoryAreaLabel } from '../utils/getRegulatoryAreaLabel'
import daysjs from 'dayjs'
import { useMemo } from 'react'
import { useGlobalStyle } from '@globalStyle'
import { useOpenExternalLink, type TrackingEvent } from '@hooks/useOpenExternalLink'
import { ContactFooter } from './ContactFooter'
import { DetailsHeader } from './DetailsHeader'

const CACEM_TEL_NUMBER = process.env.EXPO_PUBLIC_CACEM_NUMBER

const LEGICEM_TRACKING_EVENT: TrackingEvent = {
  action: "Consultation d'un lien Légicem",
  category: 'Consultation',
  name: "Consultation d'un lien Légicemen depuis une zone réglementaire"
}

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

  const goToLegicem = useOpenExternalLink(LEGICEM_TRACKING_EVENT, 'EnvRegulatoryAreaDetails')

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
      <DetailsHeader
        color={color}
        numberOfLines={!regulatoryArea.polyName ? 1 : undefined}
        onDismiss={onDismiss}
        subtitle={groupTitle}
        title={getRegulatoryAreaLabel(regulatoryArea, 'MONITORENV')}
      />
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
              {regulatoryArea.authorizationPeriods}
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
              {regulatoryArea.prohibitionPeriods}
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
        <ContactFooter phoneNumber={CACEM_TEL_NUMBER} serviceName="CACEM" />
      </View>
    </>
  )
}
