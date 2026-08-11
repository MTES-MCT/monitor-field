import type { Size } from '@constants/theme'
import { useTheme } from '@hooks/use-theme'
import { Image } from 'expo-image'
import Animated from 'react-native-reanimated'

export function LoaderIcon({ tintColor, size = 'NORMAL' }: { tintColor?: string; size?: Size }) {
  const theme = useTheme()

  const iconSize = size === 'SMALL' ? 16 : 32
  return (
    <Animated.View
      style={[
        {
          animationDuration: '2s',
          animationIterationCount: 'infinite',
          animationName: {
            '100%': {
              transform: [{ rotate: '360deg' }]
            }
          },
          animationTimingFunction: 'linear'
        }
      ]}
    >
      <Image
        source={require('@assets/icons/recurring.svg')}
        style={{
          height: iconSize,
          tintColor: tintColor ?? theme.gunMetal,
          width: iconSize
        }}
      />
    </Animated.View>
  )
}
