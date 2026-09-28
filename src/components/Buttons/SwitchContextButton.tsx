import type { AppMode } from '@config/appModes'
import { useAppContext } from '@contexts/AppContext'
import { useCameraContext } from '@contexts/CameraContext'
import { useRegulatoryAreasContext } from '@contexts/RegulatoryAreasContext'
import { useGlobalStyle } from '@globalStyle'
import { useTheme } from '@hooks/use-theme'
import useMatomo from '@matomo/useMatomo'
import { Image } from 'expo-image'
import { Pressable, StyleSheet, View } from 'react-native'
import { useMMKVString } from 'react-native-mmkv'
import { storage } from '@storage'

function getVisualState(params: { mode: AppMode; selected: boolean; theme: ReturnType<typeof useTheme> }) {
  const { mode, selected, theme } = params

  const activeTint = mode === 'MONITORFISH' ? theme.blueGray : theme.mediumSeaGreen

  return {
    container: {
      backgroundColor: selected ? activeTint : theme.gainsboro,
      borderRadius: 0,
      opacity: 1
    },
    icon: {
      opacity: selected ? 1 : 0.8,
      tintColor: selected ? theme.white : theme.slateGray
    }
  }
}

export function SwitchContextButton({ onSwitch }: { onSwitch: () => void }) {
  const { setActiveModal } = useAppContext()
  const { setClickedCoordinate } = useCameraContext()
  const { setClickedFeaturesList, setIsolatedRegulatoryAreaId, setSelectedRegulatoryArea } = useRegulatoryAreasContext()
  const theme = useTheme()
  const globalStyle = useGlobalStyle()
  const { trackEvent } = useMatomo()
  const [mode, setMode] = useMMKVString('mode', storage)

  const switchContext = (nextMode: AppMode) => {
    if (nextMode === mode) {
      return
    }

    // A tap belongs to the dataset it was made on: its pointer, list and details don't apply to the other one.
    onSwitch()
    setActiveModal(undefined)
    setClickedCoordinate(undefined)
    setClickedFeaturesList(undefined)
    setIsolatedRegulatoryAreaId(undefined)
    setSelectedRegulatoryArea(undefined)
    trackEvent({
      action: `Switch vers ${mode}`,
      category: 'Navigation',
      name: 'Switch Environnement / Pêche depuis le bouton contextuel'
    })
    setMode(nextMode)
  }

  return (
    <View style={styles.wrapper}>
      <Pressable
        onPress={() => switchContext('MONITORENV')}
        accessibilityRole="button"
        accessibilityState={{
          disabled: false,
          selected: mode === 'MONITORENV'
        }}
        style={() => [
          globalStyle.squareButton,
          getVisualState({
            mode: 'MONITORENV',
            selected: mode === 'MONITORENV',
            theme
          }).container
        ]}
      >
        <Image
          source={require('@assets/icons/algae.svg')}
          style={[
            globalStyle.iconNormal,
            getVisualState({
              mode: 'MONITORENV',
              selected: mode === 'MONITORENV',
              theme
            }).icon
          ]}
        />
      </Pressable>
      <Pressable
        onPress={() => switchContext('MONITORFISH')}
        accessibilityRole="button"
        accessibilityState={{
          disabled: false,
          selected: mode === 'MONITORFISH'
        }}
        style={() => [
          globalStyle.squareButton,
          getVisualState({
            mode: 'MONITORFISH',
            selected: mode === 'MONITORFISH',
            theme
          }).container
        ]}
      >
        <Image
          source={require('@assets/icons/fish.svg')}
          style={[
            globalStyle.iconNormal,
            getVisualState({
              mode: 'MONITORFISH',
              selected: mode === 'MONITORFISH',
              theme
            }).icon
          ]}
        />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    display: 'flex',
    flexDirection: 'row'
  }
})
