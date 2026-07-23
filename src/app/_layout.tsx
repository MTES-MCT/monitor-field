import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import { AppProvider } from '@contexts/AppContext'
import { RegulatoryAreasProvider } from '@contexts/RegulatoryAreasContext'
import { syncFishRegulatoryAreasDB } from '@features/RegulatoryAreas/useCases/syncFishRegulatoryAreasDB'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { useAppColorScheme } from '@hooks/use-app-color-scheme'
import { Appearance } from 'react-native'
import App from '.'

void SplashScreen.preventAutoHideAsync()

const getFishLayers = async () => {
  try {
    await syncFishRegulatoryAreasDB()
  } catch (error) {
    // oxlint-disable-next-line no-console
    console.warn('Unable to sync fish regulatory areas', error)
  }
}

export default function TabLayout() {
  const colorScheme = useAppColorScheme()

  useEffect(() => {
    Appearance.setColorScheme('light')
  }, [])

  useEffect(() => {
    getFishLayers().finally(() => {
      void SplashScreen.hideAsync()
    })
  }, [])

  return (
    <GestureHandlerRootView>
      <AppProvider>
        <RegulatoryAreasProvider>
          <BottomSheetModalProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <App />
            </ThemeProvider>
          </BottomSheetModalProvider>
        </RegulatoryAreasProvider>
      </AppProvider>
    </GestureHandlerRootView>
  )
}
