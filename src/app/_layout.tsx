import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router'
import { useEffect } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import { AppProvider } from '@contexts/AppContext'
import { RegulatoryAreasProvider } from '@contexts/RegulatoryAreasContext'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { useAppColorScheme } from '@hooks/use-app-color-scheme'
import { storage } from '@storage'
import { Appearance, StatusBar } from 'react-native'
import { OnBoarding } from '@features/OnBoarding'
import App from '.'
import { useMMKVBoolean } from 'react-native-mmkv'
import * as Sentry from '@sentry/react-native'

Sentry.init({
  attachStacktrace: false,
  debug: true,
  dsn: 'https://4362da132f59d3710152c4a45ae703a7@sentry.incubateur.net/313',
  enableAutoSessionTracking: false,
  enableLogs: false,
  environment: 'production', // TODO: change to dynamic env
  sendDefaultPii: false
})

export default function TabLayout() {
  const colorScheme = useAppColorScheme()
  const [isOnBoardingFinished] = useMMKVBoolean('isOnBoardingFinished', storage)

  useEffect(() => {
    Appearance.setColorScheme('light')
  }, [])

  return (
    <GestureHandlerRootView>
      <AppProvider>
        <RegulatoryAreasProvider>
          <BottomSheetModalProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <StatusBar barStyle="dark-content" />
              {!!isOnBoardingFinished ? <App /> : <OnBoarding />}
            </ThemeProvider>
          </BottomSheetModalProvider>
        </RegulatoryAreasProvider>
      </AppProvider>
    </GestureHandlerRootView>
  )
}
