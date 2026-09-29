import { useGlobalStyle } from '@globalStyle'
import type { ReactNode } from 'react'
import { View } from 'react-native'

export function Section({ children }: { children: ReactNode }) {
  const globalStyle = useGlobalStyle()

  return (
    <>
      <View style={globalStyle.separator} />
      {children}
    </>
  )
}
