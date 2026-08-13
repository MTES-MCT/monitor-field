import { useMemo } from 'react'

import { useTheme } from '@hooks/use-theme'

type Theme = ReturnType<typeof useTheme>

export function useThemedStyles<T>(createStyles: (theme: Theme) => T): T {
  const theme = useTheme()

  return useMemo(() => createStyles(theme), [createStyles, theme])
}
