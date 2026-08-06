import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router'
import { useEffect, useState } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import { AppProvider } from '@contexts/AppContext'
import { RegulatoryAreasProvider } from '@contexts/RegulatoryAreasContext'
import { syncFishRegulatoryAreasDB } from '@features/RegulatoryAreas/useCases/syncFishRegulatoryAreasDB'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { useAppColorScheme } from '@hooks/use-app-color-scheme'
import { Appearance } from 'react-native'
import App from '.'
import { syncEnvRegulatoryAreasDB } from '@features/RegulatoryAreas/useCases/syncEnvRegulatoryAreasDB'
import { CustomSplashScreen } from '@components/CustomSplashScreen'

const getFishLayers = async () => {
  try {
    await syncFishRegulatoryAreasDB()
  } catch (error) {
    // oxlint-disable-next-line no-console
    console.warn('Unable to sync fish regulatory areas', error)
  }
}

const getEnvLayers = async () => {
  try {
    await syncEnvRegulatoryAreasDB()
  } catch (error) {
    // oxlint-disable-next-line no-console
    console.warn('Unable to sync env regulatory areas', error)
  }
}

export default function TabLayout() {
  const colorScheme = useAppColorScheme()
  const [appReady, setAppReady] = useState(false)

  useEffect(() => {
    Appearance.setColorScheme('light')
  }, [])

  useEffect(() => {
    getEnvLayers().finally(() => {
      setAppReady(true)
    })
    getFishLayers().finally(() => {
      setAppReady(true)
    })
  }, [])

  if (!appReady) {
    return <CustomSplashScreen />
  }

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
