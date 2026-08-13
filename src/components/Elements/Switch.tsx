import { useTheme } from '@hooks/use-theme'
import { useEffect, useRef } from 'react'
import { Animated, Pressable, StyleSheet } from 'react-native'

type SwitchProps = {
  isOn: boolean
  onSwitch: () => void
}

export function Switch({ isOn, onSwitch }: SwitchProps) {
  const theme = useTheme()
  const thumbTranslateX = useRef(new Animated.Value(isOn ? 24 : 0)).current

  useEffect(() => {
    Animated.timing(thumbTranslateX, {
      duration: 140,
      toValue: isOn ? 24 : 0,
      useNativeDriver: true
    }).start()
  }, [isOn, thumbTranslateX])

  return (
    <Pressable
      onPress={onSwitch}
      accessibilityRole="switch"
      accessibilityState={{ checked: isOn }}
      style={[
        styles.switchTrack,
        {
          backgroundColor: isOn ? theme.blueGray : theme.lightGray
        }
      ]}
    >
      <Animated.View
        style={[
          styles.switchThumb,
          {
            backgroundColor: theme.white,
            transform: [{ translateX: thumbTranslateX }]
          }
        ]}
      />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  switchThumb: {
    borderRadius: 10,
    height: 20,
    width: 20
  },
  switchTrack: {
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    paddingHorizontal: 4,
    width: 52
  }
})
