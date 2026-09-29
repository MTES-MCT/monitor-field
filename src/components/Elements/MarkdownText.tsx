import { Fonts, Spacing } from '@constants/theme'
import { useTheme } from '@hooks/use-theme'
import { useMemo } from 'react'
import { type StyleProp, View, type ViewStyle } from 'react-native'
import { type MarkedStyles, useMarkdown } from 'react-native-marked'

// `<Markdown>` renders a FlatList, which cannot be nested in a ScrollView.
export function MarkdownText({ style, value }: { style?: StyleProp<ViewStyle>; value: string }) {
  const theme = useTheme()

  const options = useMemo(() => {
    const text = { color: theme.text, fontFamily: Fonts.sansMedium, fontSize: 16, lineHeight: 24 }
    const styles: MarkedStyles = {
      em: { ...text, fontFamily: Fonts.sansItalic, fontStyle: 'normal' },
      li: text,
      link: { ...text, color: '#295EDB', fontStyle: 'normal', textDecorationLine: 'underline' },
      paragraph: { paddingVertical: 0 },
      strong: { ...text, fontFamily: Fonts.sansBold, fontWeight: 'normal' },
      text
    }

    return {
      styles,
      theme: { colors: { border: theme.lightGray, code: theme.cultured, link: '#295EDB', text: theme.text } }
    }
  }, [theme])

  const elements = useMarkdown(value, options)

  return <View style={[{ gap: Spacing.two }, style]}>{elements}</View>
}
