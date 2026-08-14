import { logSentryError } from '@utils/sentryLogger'
import { Image } from 'expo-image'
import { Modal, Pressable, StyleSheet, View } from 'react-native'
import { useState } from 'react'
import { SettingsPage } from './SettingsPage'
import { SeaFronts } from './SeaFronts'
import { LoaderIcon } from '@components/LoaderIcon'
import { parseSeaFronts } from '@utils/parseSeaFronts'
import { useMMKVString } from 'react-native-mmkv'
import { storage } from '@storage'
import { syncRegulatoryAreasDB } from '@features/RegulatoryAreas/useCases/syncRegulatoryAreasDB'
import { useGlobalStyle } from '@globalStyle'
import { useThemedStyles } from '@hooks/use-themed-styles'

export function Settings() {
  const styles = useThemedStyles(createStyles)
  const globalStyle = useGlobalStyle()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isSeaFrontsSelectorOpen, setIsSeaFrontsSelectorOpen] = useState(false)
  const [isRefreshingData, setIsRefreshingData] = useState(false)
  const [selectedSeaFronts] = useMMKVString('selectedSeaFronts', storage)

  const refreshData = async () => {
    if (isRefreshingData) {
      return
    }

    const facades = parseSeaFronts(selectedSeaFronts)

    setIsRefreshingData(true)
    try {
      await syncRegulatoryAreasDB(facades, { forceRefresh: true })
    } catch (e) {
      logSentryError(e, 'Unable to sync regulatory areas')
    } finally {
      setIsRefreshingData(false)
    }
  }

  const closeSettings = () => {
    setIsSettingsOpen(false)
    setIsSeaFrontsSelectorOpen(false)
  }

  const closeAll = () => {
    setIsSettingsOpen(false)
    setIsSeaFrontsSelectorOpen(false)

    if (!isRefreshingData) {
      return
    }

    refreshData().catch(e => {
      logSentryError(e, 'Unable to sync regulatory areas')
    })
  }

  return (
    <>
      <Pressable
        onPress={() => setIsSettingsOpen(true)}
        accessibilityRole="button"
        accessibilityState={{ disabled: false }}
        style={styles.buttonWrapper}
      >
        {isRefreshingData && (
          <View style={globalStyle.dot}>
            <LoaderIcon tintColor="white" size="SMALL" />
          </View>
        )}
        <Image source={require('@assets/icons/settings.svg')} style={globalStyle.iconNormal} />
      </Pressable>
      <Modal
        transparent
        visible={isSettingsOpen || isSeaFrontsSelectorOpen}
        animationType="slide"
        onRequestClose={closeAll}
      >
        <View style={globalStyle.modalContainer}>
          {isSettingsOpen && (
            <SettingsPage
              refreshData={refreshData}
              setIsRefreshingData={(value: boolean) => setIsRefreshingData(value)}
              closeSettings={closeSettings}
              openSeaFrontsSelector={() => {
                setIsSettingsOpen(false)
                setIsSeaFrontsSelectorOpen(true)
              }}
            />
          )}
          {isSeaFrontsSelectorOpen && (
            <SeaFronts
              refreshData={refreshData}
              setIsRefreshingData={(value: boolean) => setIsRefreshingData(value)}
              closeSettings={closeAll}
              closeSeaFrontSelector={() => {
                setIsSeaFrontsSelectorOpen(false)
                setIsSettingsOpen(true)
              }}
            />
          )}
        </View>
      </Modal>
    </>
  )
}

const createStyles = theme =>
  StyleSheet.create({
    buttonWrapper: {
      alignItems: 'center',
      backgroundColor: theme.white,
      height: 48,
      justifyContent: 'center',
      width: 48
    }
  })
