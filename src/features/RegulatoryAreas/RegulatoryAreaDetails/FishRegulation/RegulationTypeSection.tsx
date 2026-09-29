import { ThemedText } from '@components/Elements/Text'
import type { RegulatoryReference } from '@domain/entities/regulatoryAreas/FishRegulation'
import { styles } from '../style'
import { RegulatoryReferences } from './RegulatoryReferences'
import { Section } from './Section'

export function RegulationTypeSection({
  regulatoryReferences,
  type
}: {
  regulatoryReferences: RegulatoryReference[]
  type: string
}) {
  return (
    <Section>
      <ThemedText type="small" themeColor="slateGray" style={styles.horizontalPadding}>
        Ensemble reg.
      </ThemedText>
      <ThemedText type="default" style={styles.horizontalPadding}>
        {type}
      </ThemedText>
      <RegulatoryReferences regulatoryReferences={regulatoryReferences} />
    </Section>
  )
}
