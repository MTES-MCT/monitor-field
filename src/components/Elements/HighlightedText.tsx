import { useMemo } from 'react'
import { Text } from 'react-native'

import { useTheme } from '@hooks/use-theme'
import { getHighlightSegments } from '@utils/getHighlightSegments'
import { ThemedText, type ThemedTextProps } from './Text'

type HighlightedTextProps = Omit<ThemedTextProps, 'children'> & {
  children: string | null | undefined
  searchQuery: string | undefined
}

export function HighlightedText({ children, searchQuery, ...rest }: HighlightedTextProps) {
  const theme = useTheme()
  const segments = useMemo(() => getHighlightSegments(children ?? '', searchQuery), [children, searchQuery])

  return (
    // oxlint-disable-next-line react/jsx-props-no-spreading
    <ThemedText {...rest}>
      {segments.map((segment, index) =>
        segment.highlighted ? (
          // oxlint-disable-next-line react/no-array-index-key
          <Text key={index} style={{ backgroundColor: theme.goldenPoppyBorder }}>
            {segment.text}
          </Text>
        ) : (
          segment.text
        )
      )}
    </ThemedText>
  )
}
