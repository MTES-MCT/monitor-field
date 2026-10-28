import { Pressable } from 'react-native'
import { SvgXml } from 'react-native-svg'

import { PRO_CONNECT_BUTTON_HOVER_SVG, PRO_CONNECT_BUTTON_SVG } from './proConnectButtonSvg'

type ProConnectButtonProps = {
  disabled?: boolean
  onPress: () => void
}

export function ProConnectButton({ disabled = false, onPress }: ProConnectButtonProps) {
  return (
    <Pressable
      accessibilityLabel="S'identifier avec ProConnect"
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={{ alignSelf: 'center', height: 56, opacity: disabled ? 0.5 : 1, width: 214 }}
    >
      {({ pressed }) => (
        <SvgXml height={56} width={214} xml={pressed ? PRO_CONNECT_BUTTON_HOVER_SVG : PRO_CONNECT_BUTTON_SVG} />
      )}
    </Pressable>
  )
}
