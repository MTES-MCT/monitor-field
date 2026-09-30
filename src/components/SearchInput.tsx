import { View, TextInput } from 'react-native'
import { CloseButton } from './Buttons/CloseButton'
import { Spacing } from '@constants/theme'
import { BackButton } from './Buttons/BackButton'
import { useGlobalStyle } from '@globalStyle'
import { forwardRef } from 'react'
import { Image } from 'expo-image'
import { useTheme } from '@hooks/use-theme'

type SearchInputProps = {
  onClose?: () => void
  searchText?: string
  onChangeText?: (text: string) => void
  onSubmit?: () => void
  onClearText: () => void
  onFocus?: () => void
  isLight?: boolean
  style?: object
  withBackButton?: boolean
  autoFocus?: boolean
}

export const SearchInput = forwardRef<TextInput, SearchInputProps>(
  (
    {
      onClose = () => {},
      searchText,
      onChangeText = () => {},
      onSubmit = () => {},
      onClearText,
      onFocus = () => {},
      isLight = true,
      style = {},
      withBackButton = true,
      autoFocus = false
    },
    ref
  ) => {
    const globalStyle = useGlobalStyle()
    const theme = useTheme()
    return (
      <View style={[isLight ? globalStyle.searchBox : globalStyle.searchBoxGray, style]}>
        {withBackButton && <BackButton onBack={onClose} style={{ marginLeft: Spacing.two }} />}

        <TextInput
          ref={ref}
          style={globalStyle.input}
          value={searchText}
          onChangeText={onChangeText}
          placeholder="Rechercher"
          placeholderTextColor={theme.slateGray}
          returnKeyType="search"
          onSubmitEditing={onSubmit}
          onFocus={onFocus}
          autoFocus={autoFocus}
        />

        {searchText && searchText.length > 0 ? (
          <CloseButton onClose={onClearText} isSmall style={{ marginRight: Spacing.two }} />
        ) : (
          <Image
            source={require('@assets/icons/search.svg')}
            style={[globalStyle.iconSmall, { marginRight: Spacing.two }]}
          />
        )}
      </View>
    )
  }
)

SearchInput.displayName = 'SearchInput'
