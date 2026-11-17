import { MarkdownText } from '@components/Elements/MarkdownText'
import { styles } from '../style'
import { Section } from './Section'
import { useFishSearchQuery } from './useFishSearchQuery'

export function GeneralRemarksSection({ generalRemarks }: { generalRemarks: string | undefined }) {
  const searchQuery = useFishSearchQuery()

  if (!generalRemarks) {
    return null
  }

  return (
    <Section>
      <MarkdownText style={styles.horizontalPadding} value={generalRemarks} searchQuery={searchQuery} />
    </Section>
  )
}
