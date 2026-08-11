import { useTheme } from '@hooks/use-theme'
import { Image } from 'expo-image'
import { Modal, Pressable, StyleSheet, View } from 'react-native'
import { useState } from 'react'
import { SettingsPage } from './SettingsPage'
import { Spacing } from '@constants/theme'
import { SeaFronts } from './SeaFronts'

export function Settings() {
  const theme = useTheme()

  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isSeaFrontsSelectorOpen, setIsSeaFrontsSelectorOpen] = useState(false)

  const closeAll = () => {
    setIsSettingsOpen(false)
    setIsSeaFrontsSelectorOpen(false)
  }
  return (
    <>
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
              closeSettings={closeAll}
              openSeaFrontsSelector={() => {
                setIsSettingsOpen(false)
                setIsSeaFrontsSelectorOpen(true)
              }}
            />
          )}
          {isSeaFrontsSelectorOpen && (
            <SeaFronts
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
  icon: {
    height: Spacing.five,
    width: Spacing.five
  },
  modalContainer: {
    height: '100%',
    marginTop: 90,
    position: 'absolute',
    width: '100%'
  }
})
