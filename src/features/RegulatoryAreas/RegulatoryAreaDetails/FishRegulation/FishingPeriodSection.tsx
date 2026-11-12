import { MarkdownText } from '@components/Elements/MarkdownText'
import { HighlightedText } from '@components/Elements/HighlightedText'
import type { FishingPeriod } from '@domain/entities/regulatoryAreas/FishRegulation'
import { fishingPeriodToString } from '../../utils/fishRegulation/fishingPeriodToString'
import { styles } from '../style'
import { Section } from './Section'
import { SectionTitle } from './SectionTitle'
import { useFishSearchQuery } from './useFishSearchQuery'

export function FishingPeriodSection({ fishingPeriod }: { fishingPeriod: FishingPeriod | undefined }) {
  const searchQuery = useFishSearchQuery()
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
        <HighlightedText type="default" style={styles.horizontalPadding} searchQuery={searchQuery}>
          {text}
        </HighlightedText>
      )}
      {!!fishingPeriod.otherInfo && (
        <MarkdownText style={styles.horizontalPadding} value={fishingPeriod.otherInfo} searchQuery={searchQuery} />
      )}
    </Section>
  )
}
