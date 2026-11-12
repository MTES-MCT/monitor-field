import { HighlightedText } from '@components/Elements/HighlightedText'
import { ThemedText } from '@components/Elements/Text'
import type { RegulatoryReference } from '@domain/entities/regulatoryAreas/FishRegulation'
import { styles } from '../style'
import { RegulatoryReferences } from './RegulatoryReferences'
import { Section } from './Section'
import { useFishSearchQuery } from './useFishSearchQuery'

export function RegulationTypeSection({
  regulatoryReferences,
  type
}: {
  regulatoryReferences: RegulatoryReference[]
  type: string
}) {
  const searchQuery = useFishSearchQuery()

  return (
    <Section>
      <ThemedText type="small" themeColor="slateGray" style={styles.horizontalPadding}>
        Ensemble reg.
      </ThemedText>
      <HighlightedText type="default" style={styles.horizontalPadding} searchQuery={searchQuery}>
        {type}
      </HighlightedText>
      <RegulatoryReferences regulatoryReferences={regulatoryReferences} />
    </Section>
  )
}
