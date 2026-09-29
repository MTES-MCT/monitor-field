import { MarkdownText } from '@components/Elements/MarkdownText'
import type { GearRegulation } from '@domain/entities/regulatoryAreas/FishRegulation'
import { regulatedGearsIsNotEmpty } from '../../utils/fishRegulation/regulatoryContent'
import { styles } from '../style'
import { RegulatedGears } from './RegulatedGears'
import { Section } from './Section'

export function GearRegulationSection({ gearRegulation }: { gearRegulation: GearRegulation | undefined }) {
  if (!gearRegulation) {
    return null
  }

  const { authorized, otherInfo, unauthorized } = gearRegulation
  const hasAuthorizedContent = regulatedGearsIsNotEmpty(authorized)
  const hasUnauthorizedContent = regulatedGearsIsNotEmpty(unauthorized)

  if (!hasAuthorizedContent && !hasUnauthorizedContent && !otherInfo) {
    return null
  }

  return (
    <Section>
      {hasAuthorizedContent && <RegulatedGears authorized regulatedGears={authorized} />}
      {hasUnauthorizedContent && <RegulatedGears authorized={false} regulatedGears={unauthorized} />}
      {!!otherInfo && <MarkdownText style={styles.horizontalPadding} value={otherInfo} />}
    </Section>
  )
}
