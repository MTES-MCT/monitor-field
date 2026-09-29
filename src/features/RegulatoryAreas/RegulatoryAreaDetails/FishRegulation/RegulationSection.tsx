import { MarkdownText } from '@components/Elements/MarkdownText'
import type { ReactNode } from 'react'
import { styles } from '../style'
import { Section } from './Section'

export function RegulationSection({
  children,
  otherInfo
}: {
  children: ReactNode
  otherInfo: string | null | undefined
}) {
  return (
    <Section>
      {children}
      {!!otherInfo && <MarkdownText style={styles.horizontalPadding} value={otherInfo} />}
    </Section>
  )
}
