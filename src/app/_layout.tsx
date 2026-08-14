import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router'
import { useEffect, useState } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import { AppProvider } from '@contexts/AppContext'
import { RegulatoryAreasProvider } from '@contexts/RegulatoryAreasContext'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { useAppColorScheme } from '@hooks/use-app-color-scheme'
import { storage } from '@storage'
import { Appearance, StatusBar } from 'react-native'
import { OnBoarding } from '@features/OnBoarding'
import App from '.'
import { useMMKVBoolean, useMMKVString } from 'react-native-mmkv'
import { CustomSplashScreen } from '@components/CustomSplashScreen'
import { syncRegulatoryAreasDB } from '@features/RegulatoryAreas/useCases/syncRegulatoryAreasDB'
import { parseSeaFronts } from '@utils/parseSeaFronts'

export default function TabLayout() {
  const colorScheme = useAppColorScheme()
  const [isOnBoardingFinished] = useMMKVBoolean('isOnBoardingFinished', storage)
  const [selectedSeaFronts] = useMMKVString('selectedSeaFronts', storage)
  const [isAppReady, setIsAppReady] = useState(false)

  useEffect(() => {
    Appearance.setColorScheme('light')
  }, [])

  useEffect(() => {
    async function refreshData() {
      const facades = parseSeaFronts(selectedSeaFronts)
      await syncRegulatoryAreasDB(facades)
      setIsAppReady(true)
    }

    if (!!isOnBoardingFinished) {
      refreshData()

      return
    }
    setIsAppReady(true)
    // call only once on app start to avoid unnecessary data refreshes
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!isAppReady) {
    return <CustomSplashScreen />
  }

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
