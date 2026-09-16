import { CloseButton } from '@components/Buttons/CloseButton'
import { Spacing } from '@constants/theme'
import { useGlobalStyle } from '@globalStyle'
import { Image } from 'expo-image'
import { useRef } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTheme } from '@hooks/use-theme'
import { TextInput } from 'react-native-gesture-handler'

type SearchThemesProps = {
  value: string
  onChangeText: (value: string) => void
}

export function SearchThemes({ value, onChangeText }: SearchThemesProps) {
  const globalStyle = useGlobalStyle()
  const inputRef = useRef<TextInput>(null)
  const theme = useTheme()
  const styles = createStyles(theme)

  return (
    <View style={[globalStyle.searchBox, styles.styledSearchBox]}>
      <TextInput
        ref={inputRef}
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder="Rechercher..."
        returnKeyType="search"
      />

      {value.length > 0 ? (
        <CloseButton onClose={() => onChangeText('')} isSmall />
      ) : (
        <Image source={require('@assets/icons/search.svg')} style={globalStyle.iconSmall} />
      )}
    </View>
  )
}

const createStyles = theme =>
  StyleSheet.create({
    input: {
      color: theme.charcoal,
      flex: 1,
      fontSize: 17,
      paddingVertical: 0
    },
    styledSearchBox: {
      backgroundColor: theme.gainsboro,
      flex: 0,
      paddingHorizontal: Spacing.four
    }
  })
