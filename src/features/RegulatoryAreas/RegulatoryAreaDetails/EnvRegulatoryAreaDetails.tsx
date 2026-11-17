import { HighlightedText } from '@components/Elements/HighlightedText'
import { ThemedText } from '@components/Elements/Text'
import { View } from 'react-native'
import { styles } from './style'
import { useTheme } from '@hooks/use-theme'
import type { EnvRegulatoryAreaSummary } from '@domain/entities/regulatoryAreas/RegulatoryAreaSummary'
import { Spacing } from '@constants/theme'
import { getRegulatoryAreaLabel } from '../utils/getRegulatoryAreaLabel'
import daysjs from 'dayjs'
import { memo, useMemo } from 'react'
import { useGlobalStyle } from '@globalStyle'
import { useOpenExternalLink, type TrackingEvent } from '@hooks/useOpenExternalLink'
import { ContactFooter } from './ContactFooter'
import { DetailsHeader } from './DetailsHeader'
import { useRegulatoryAreasContext } from '@contexts/RegulatoryAreasContext'

const CACEM_TEL_NUMBER = process.env.EXPO_PUBLIC_CACEM_NUMBER

const LEGICEM_TRACKING_EVENT: TrackingEvent = {
  action: "Consultation d'un lien Légicem",
  category: 'Consultation',
  name: "Consultation d'un lien Légicemen depuis une zone réglementaire"
}

function EnvRegulatoryAreaDetailsComponent({
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

  const {
    filters: { searchQueryEnv }
  } = useRegulatoryAreasContext()

  const goToLegicem = useOpenExternalLink(LEGICEM_TRACKING_EVENT, 'EnvRegulatoryAreaDetails')
  const parsedThemes = regulatoryArea.themes ? Object.entries(JSON.parse(regulatoryArea.themes)) : []
  const themes = parsedThemes?.map(([theme, _]) => theme).join(', ') ?? ''
  const subThemes = parsedThemes?.map(([_, subTheme]) => subTheme).join(', ') ?? ''

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
        searchQuery={searchQueryEnv}
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
        <HighlightedText type="default" style={styles.horizontalPadding} searchQuery={searchQueryEnv}>
          {regulatoryArea.resume}
        </HighlightedText>
        <ThemedText type="small" style={styles.labelStyle}>
          Ensemble reg.
        </ThemedText>
        <HighlightedText type="default" style={styles.horizontalPadding} searchQuery={searchQueryEnv}>
          {regulatoryArea.type}
        </HighlightedText>
        {themes && (
          <>
            <ThemedText type="small" style={styles.labelStyle}>
              Thématiques
            </ThemedText>
            <HighlightedText type="default" style={styles.horizontalPadding} searchQuery={searchQueryEnv}>
              {themes}
            </HighlightedText>
          </>
        )}
        {subThemes && (
          <>
            <ThemedText type="small" style={styles.labelStyle}>
              Sous-thématiques
            </ThemedText>
            <HighlightedText type="default" style={styles.horizontalPadding} searchQuery={searchQueryEnv}>
              {subThemes}
            </HighlightedText>
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
            <HighlightedText type="default" style={styles.horizontalPadding} searchQuery={searchQueryEnv}>
              {regulatoryArea.authorizationPeriods}
            </HighlightedText>
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
            <HighlightedText type="default" style={styles.horizontalPadding} searchQuery={searchQueryEnv}>
              {regulatoryArea.prohibitionPeriods}
            </HighlightedText>
          </>
        )}
        <View style={globalStyle.separator} />
        <View>
          <ThemedText type="small" style={{ ...styles.labelStyle, marginTop: Spacing.two }}>
            Résumé réglementaire sur Légicem
          </ThemedText>
          <HighlightedText type="default" style={styles.horizontalPadding} searchQuery={searchQueryEnv}>
            {regulatoryArea.refReg}
          </HighlightedText>
          <HighlightedText
            type="link"
            style={styles.horizontalPadding}
            onPress={() => goToLegicem(regulatoryArea.url)}
            searchQuery={searchQueryEnv}
          >
            {regulatoryArea.url}
          </HighlightedText>
        </View>
        <ContactFooter phoneNumber={CACEM_TEL_NUMBER} serviceName="CACEM" />
      </View>
    </>
  )
}

export const EnvRegulatoryAreaDetails = memo(EnvRegulatoryAreaDetailsComponent)
