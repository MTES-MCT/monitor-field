import { BottomTabInset, Spacing } from '@constants/theme'
import { useTheme } from '@hooks/use-theme'
import { StyleSheet } from 'react-native'

export function useGlobalStyle() {
  const theme = useTheme()

  return StyleSheet.create({
    buttonBase: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      padding: Spacing.three,
      position: 'relative'
    },
    dot: {
      alignItems: 'center',
      backgroundColor: theme.blueGray,
      borderRadius: 10,
      height: 20,
      justifyContent: 'center',
      left: 35,
      position: 'absolute',
      top: -10,
      width: 20
    },
    iconLarge: {
      height: 48,
      width: 48
    },
    iconNormal: {
      height: 24,
      width: 24
    },
    iconSmall: {
      height: 20,
      width: 20
    },
    modalContainer: {
      backgroundColor: theme.white,
      height: '90%',
      marginTop: 90,
      paddingBottom: BottomTabInset,
      width: '100%'
    },
    separator: {
      backgroundColor: theme.lightGray,
      height: 1,
      marginVertical: Spacing.four
    },
    textInput: {
      alignItems: 'center',
      borderColor: theme.lightGray,
      borderWidth: 1,
      flexDirection: 'row',
      height: 48
    },
    textUnderline: {
      textDecorationLine: 'underline'
    }
  })
}
