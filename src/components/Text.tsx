import { Platform, Text as RNText, StyleSheet, type TextProps } from 'react-native'

import { Fonts, type ThemeColor } from '@constants/theme'
import { useTheme } from '@hooks/use-theme'

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'defaultBold' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code'
  themeColor?: ThemeColor
}

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme()

  return (
    <RNText
      style={[
        { color: theme[themeColor ?? 'text'] },
        type === 'default' && styles.default,
        type === 'defaultBold' && styles.defaultBold,
        type === 'title' && styles.title,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'link' && styles.link,
        type === 'linkPrimary' && styles.linkPrimary,
        type === 'code' && styles.code,
        style
      ]}
      // oxlint-disable-next-line react/jsx-props-no-spreading
      {...rest}
    />
  )
}

const styles = StyleSheet.create({
  code: {
    fontFamily: Fonts.mono,
    fontSize: 12,
    fontWeight: Platform.select({ android: 700 }) ?? 500
  },
  default: {
    fontFamily: Fonts.sansMedium,
    fontSize: 16,
    lineHeight: 24
  },
  defaultBold: {
    fontFamily: Fonts.sansBold,
    fontSize: 16,
    lineHeight: 24
  },
  link: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    lineHeight: 30
  },
  linkPrimary: {
    color: '#3c87f7',
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    lineHeight: 30
  },
  small: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    lineHeight: 20
  },
  smallBold: {
    fontFamily: Fonts.sansBold,
    fontSize: 14,
    lineHeight: 20
  },
  subtitle: {
    fontFamily: Fonts.sansBold,
    fontSize: 24,
    lineHeight: 32
  },
  title: {
    fontFamily: Fonts.sansBold,
    fontSize: 32,
    lineHeight: 40
  }
})
