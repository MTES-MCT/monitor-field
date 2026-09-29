import { MarkdownText } from '@components/Elements/MarkdownText'
import { styles } from '../style'
import { Section } from './Section'

export function GeneralRemarksSection({ generalRemarks }: { generalRemarks: string | undefined }) {
  if (!generalRemarks) {
    return null
  }

  return (
    <Section>
      <MarkdownText style={styles.horizontalPadding} value={generalRemarks} />
    </Section>
  )
}
