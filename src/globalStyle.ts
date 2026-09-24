import { Spacing } from '@constants/theme'
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
    pageHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: Spacing.four
    },
    requiredField: {
      color: theme.maximumRed
    },
    searchBox: {
      alignItems: 'center',
      borderColor: theme.lightGray,
      borderWidth: 1,
      flex: 1,
      flexDirection: 'row',
      height: 48,
      marginRight: Spacing.two,
      paddingHorizontal: Spacing.one
    },
    separator: {
      backgroundColor: theme.lightGray,
      height: 1,
      marginVertical: Spacing.four
    },
    squareButton: {
      alignItems: 'center',
      boxShadow: '0px 3px 6px rgba(112, 119, 133, 0.25)',
      height: 48,
      justifyContent: 'center',
      width: 48
    },
    textInput: {
      alignItems: 'center',
      borderColor: theme.lightGray,
      borderWidth: 1,
      flexDirection: 'row',
      height: 48
    },
    textInputGray: {
      alignItems: 'center',
      backgroundColor: theme.gainsboro,
      flexDirection: 'row',
      height: 48
    },
    textUnderline: {
      textDecorationLine: 'underline'
    }
  })
}
