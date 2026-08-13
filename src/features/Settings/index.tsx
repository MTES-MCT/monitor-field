import { useTheme } from '@hooks/use-theme'
import { logSentryError } from '@utils/sentryLogger'
import { Image } from 'expo-image'
import { Modal, Pressable, StyleSheet, View } from 'react-native'
import { useState } from 'react'
import { SettingsPage } from './SettingsPage'
import { Spacing } from '@constants/theme'
import { SeaFronts } from './SeaFronts'
import { LoaderIcon } from '@components/LoaderIcon'
import { parseSeaFronts } from '@utils/parseSeaFronts'
import { useMMKVString } from 'react-native-mmkv'
import { storage } from '@storage'
import { syncRegulatoryAreasDB } from '@features/RegulatoryAreas/useCases/syncRegulatoryAreasDB'

export function Settings() {
  const theme = useTheme()

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
      {isRefreshingData && (
        <View
          style={[
            styles.dot,
            {
              backgroundColor: theme.blueGray
            }
          ]}
        >
          <LoaderIcon tintColor={theme.white} size="SMALL" />
        </View>
      )}
      <Pressable
        onPress={() => setIsSettingsOpen(true)}
        accessibilityRole="button"
        accessibilityState={{ disabled: false }}
        style={() => [styles.buttonWrapper, { backgroundColor: theme.white }]}
      >
        <Image source={require('@assets/icons/settings.svg')} style={styles.icon} />
      </Pressable>
      <Modal
        transparent
        visible={isSettingsOpen || isSeaFrontsSelectorOpen}
        animationType="slide"
        onRequestClose={closeAll}
      >
        <View style={styles.modalContainer}>
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

export const styles = StyleSheet.create({
  buttonWrapper: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    width: 48
  },
  dot: {
    alignItems: 'center',
    borderRadius: 10,
    height: 20,
    justifyContent: 'center',
    position: 'absolute',
    right: -5,
    top: -5,
    width: 20,
    zIndex: 2
  },
  icon: {
    height: Spacing.five,
    width: Spacing.five
  },
  modalContainer: {
    height: '100%',
    marginTop: 90,
    position: 'absolute',
    width: '100%'
  },
  syncBanner: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    position: 'absolute',
    top: 48,
    zIndex: 2
  }
})
