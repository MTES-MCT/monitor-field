import { MarkdownText } from '@components/Elements/MarkdownText'
import { ThemedText } from '@components/Elements/Text'
import type { FishingPeriod } from '@domain/entities/regulatoryAreas/FishRegulation'
import { fishingPeriodToString } from '../../utils/fishRegulation/fishingPeriodToString'
import { styles } from '../style'
import { Section } from './Section'
import { SectionTitle } from './SectionTitle'

export function FishingPeriodSection({ fishingPeriod }: { fishingPeriod: FishingPeriod | undefined }) {
  const text = fishingPeriodToString(fishingPeriod)

  if (!fishingPeriod || (!text && !fishingPeriod.otherInfo)) {
    return null
  }

  return (
    <Section>
      <SectionTitle status={fishingPeriod.authorized ? 'authorized' : 'forbidden'}>
        {`Période de pêche ${fishingPeriod.authorized ? 'autorisée' : 'interdite'}`}
      </SectionTitle>
      {!!text && (
        <ThemedText type="default" style={styles.horizontalPadding}>
          {text}
        </ThemedText>
      )}
      {!!fishingPeriod.otherInfo && <MarkdownText style={styles.horizontalPadding} value={fishingPeriod.otherInfo} />}
    </Section>
  )
}
