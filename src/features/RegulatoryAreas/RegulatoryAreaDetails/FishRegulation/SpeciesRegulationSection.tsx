import { MarkdownText } from '@components/Elements/MarkdownText'
import type { SpeciesRegulation } from '@domain/entities/regulatoryAreas/FishRegulation'
import { regulatedSpeciesIsNotEmpty } from '../../utils/fishRegulation/regulatoryContent'
import { styles } from '../style'
import { RegulatedSpecies } from './RegulatedSpecies'
import { Section } from './Section'

export function SpeciesRegulationSection({ speciesRegulation }: { speciesRegulation: SpeciesRegulation | undefined }) {
  if (!speciesRegulation) {
    return null
  }

  const { authorized, otherInfo, unauthorized } = speciesRegulation
  const hasAuthorizedContent = regulatedSpeciesIsNotEmpty(authorized)
  const hasUnauthorizedContent = regulatedSpeciesIsNotEmpty(unauthorized)

  if (!hasAuthorizedContent && !hasUnauthorizedContent && !otherInfo) {
    return null
  }

  return (
    <Section>
      {hasAuthorizedContent && <RegulatedSpecies authorized regulatedSpecies={authorized} />}
      {hasUnauthorizedContent && <RegulatedSpecies authorized={false} regulatedSpecies={unauthorized} />}
      {!!otherInfo && <MarkdownText style={styles.horizontalPadding} value={otherInfo} />}
    </Section>
  )
}
