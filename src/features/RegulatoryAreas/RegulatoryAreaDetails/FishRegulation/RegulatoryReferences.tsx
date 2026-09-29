import { ThemedText } from '@components/Elements/Text'
import type { RegulatoryReference } from '@domain/entities/regulatoryAreas/FishRegulation'
import { useGlobalStyle } from '@globalStyle'
import { type TrackingEvent, useOpenExternalLink } from '@hooks/useOpenExternalLink'
import { View } from 'react-native'
import { toPublicLegipecheUrl } from '../../utils/fishRegulation/legipecheUrl'
import { getRegulatoryTextTypeLabel } from '../../utils/fishRegulation/regulationLabels'
import { styles } from '../style'
import { SectionTitle } from './SectionTitle'

const LEGIPECHE_TRACKING_EVENT: TrackingEvent = {
  action: "Consultation d'un lien Légipêche",
  category: 'Consultation',
  name: "Consultation d'un lien Légipêche depuis une zone réglementaire"
}

export function RegulatoryReferences({ regulatoryReferences }: { regulatoryReferences: RegulatoryReference[] }) {
  if (regulatoryReferences.length === 0) {
    return null
  }

  return (
    <View style={styles.references}>
      <SectionTitle>Références réglementaires</SectionTitle>
      <View style={styles.regulationList}>
        {regulatoryReferences.map((reference, index) => (
          <ReferenceRow key={`${index}-${reference.reference}`} regulatoryReference={reference} />
        ))}
      </View>
    </View>
  )
}

function ReferenceRow({
  regulatoryReference: { reference, textType, url }
}: {
  regulatoryReference: RegulatoryReference
}) {
  const globalStyle = useGlobalStyle()
  const openLegipeche = useOpenExternalLink(LEGIPECHE_TRACKING_EVENT, 'RegulatoryReferences')
  const textTypeLabel = getRegulatoryTextTypeLabel(textType)

  return (
    <View style={[styles.horizontalPadding, styles.referenceRow]}>
      <ThemedText type="default">→</ThemedText>
      <View style={{ flex: 1 }}>
        {!!textTypeLabel && <ThemedText type="default">{textTypeLabel}</ThemedText>}
        {url ? (
          <ThemedText
            type="link"
            style={globalStyle.textUnderline}
            onPress={() => openLegipeche(toPublicLegipecheUrl(url))}
          >
            {reference}
          </ThemedText>
        ) : (
          <ThemedText type="default">{reference}</ThemedText>
        )}
      </View>
    </View>
  )
}
