import type { Size } from '@constants/theme'
import { useTheme } from '@hooks/use-theme'
import { Image } from 'expo-image'
import Animated from 'react-native-reanimated'

const sizes = {
  LARGE: 32,
  NORMAL: 24,
  SMALL: 16
}

export function LoaderIcon({ tintColor, size = 'NORMAL' }: { tintColor?: string; size?: Size }) {
  const theme = useTheme()

  const iconSize = sizes[size]
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
          tintColor: theme[tintColor ?? 'gunMetal'],
          width: iconSize
        }}
      />
    </Animated.View>
  )
}
