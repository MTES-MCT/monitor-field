import { ThemedText } from '@components/Elements/Text'
import type { RegulatoryReference } from '@domain/entities/regulatoryAreas/FishRegulation'
import { useGlobalStyle } from '@globalStyle'
import useMatomo from '@matomo/useMatomo'
import { logToSentry } from '@utils/sentryLogger'
import * as Linking from 'expo-linking'
import { useCallback } from 'react'
import { View } from 'react-native'
import { getRegulatoryTextTypeLabel } from '../../utils/fishRegulation/regulatoryContent'
import { styles } from '../style'
import { SectionTitle } from './SectionTitle'

export function RegulatoryReferences({ regulatoryReferences }: { regulatoryReferences: RegulatoryReference[] }) {
  const globalStyle = useGlobalStyle()
  const { trackEvent } = useMatomo()

  const goToLegipeche = useCallback(
    async (url: string) => {
      const externalUrl = url.replace(
        'legipeche.metier.e2.rie.gouv.fr',
        'extranet.legipeche.metier.developpement-durable.gouv.fr'
      )
      const supported = await Linking.canOpenURL(externalUrl)

      if (supported) {
        await Linking.openURL(externalUrl)
        trackEvent({
          action: "Consultation d'un lien Légipêche",
          category: 'Consultation',
          name: "Consultation d'un lien Légipêche depuis une zone réglementaire"
        })
      } else {
        logToSentry(`Don't know how to open this URL: ${externalUrl}`, 'info', {
          extra: { label: 'RegulatoryReferences' }
        })
      }
    },
    [trackEvent]
  )

  if (regulatoryReferences.length === 0) {
    return null
  }

  return (
    <View style={styles.references}>
      <SectionTitle>Références réglementaires</SectionTitle>
      <View style={styles.regulationList}>
        {regulatoryReferences.map(({ reference, textType, url }) => {
          const textTypeLabel = getRegulatoryTextTypeLabel(textType)

          return (
            <View key={`${url}${reference}`} style={[styles.horizontalPadding, styles.referenceRow]}>
              <ThemedText type="default">→</ThemedText>
              <View style={{ flex: 1 }}>
                {!!textTypeLabel && <ThemedText type="default">{textTypeLabel}</ThemedText>}
                {url ? (
                  <ThemedText type="link" style={globalStyle.textUnderline} onPress={() => goToLegipeche(url)}>
                    {reference}
                  </ThemedText>
                ) : (
                  <ThemedText type="default">{reference}</ThemedText>
                )}
              </View>
            </View>
          )
        })}
      </View>
    </View>
  )
}
