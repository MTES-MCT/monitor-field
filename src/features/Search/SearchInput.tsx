import { BackButton } from '@components/Buttons/BackButton'
import { CloseButton } from '@components/Buttons/CloseButton'
import { Fonts, Spacing } from '@constants/theme'
import { useRegulatoryAreasContext } from '@contexts/RegulatoryAreasContext'
import { useAppContext } from '@contexts/AppContext'
import { useGlobalStyle } from '@globalStyle'
import { useThemedStyles } from '@hooks/use-themed-styles'
import { Image } from 'expo-image'
import { useCallback, useRef } from 'react'
import { StyleSheet, TextInput, View } from 'react-native'
import { useRouter } from 'expo-router'

type SearchInputProps = {
  onClose: () => void
  text?: string
  setText: (text: string) => void
}

export function SearchInput({ onClose, text, setText }: SearchInputProps) {
  const router = useRouter()
  const inputRef = useRef<TextInput>(null)
  const styles = useThemedStyles(createStyles)
  const globalStyle = useGlobalStyle()
  const { setFilters } = useRegulatoryAreasContext()
  const { config, setActiveModal } = useAppContext()

  const onChangeText = (newText: string) => {
    setText(newText)
  }

  const clearText = () => {
    setText('')
    setFilters(currentFilters => ({
      ...currentFilters,
      ...(config.mode === 'MONITORENV' ? { searchQueryEnv: undefined } : { searchQueryFish: undefined })
    }))
  }

  const onCloseSearchInput = () => {
    inputRef.current?.blur()
    onClose()
  }

  const onSubmit = useCallback(() => {
    const trimmedText = text?.trim()
    setFilters(currentFilters => ({
      ...currentFilters,
      ...(config.mode === 'MONITORENV'
        ? { searchQueryEnv: trimmedText ?? undefined }
        : { searchQueryFish: trimmedText ?? undefined })
    }))
    router.back()
    setActiveModal('REGULATORY_AREAS_LIST_MODAL')
  }, [setActiveModal, router, text, config.mode, setFilters])

  return (
    <>
      <View style={{ flexDirection: 'row', paddingHorizontal: Spacing.three }}>
        <View style={styles.searchBox}>
          <BackButton onBack={onCloseSearchInput} style={{ marginLeft: Spacing.two }} />

          <TextInput
            ref={inputRef}
            autoFocus
            style={styles.input}
            value={text}
            onChangeText={onChangeText}
            placeholder="Rechercher"
            returnKeyType="search"
            onSubmitEditing={onSubmit}
          />

          {text && text.length > 0 ? (
            <CloseButton onClose={clearText} isSmall style={{ marginRight: Spacing.two }} />
          ) : (
            <Image
              source={require('@assets/icons/search.svg')}
              style={[globalStyle.iconSmall, { marginRight: Spacing.two }]}
            />
          )}
        </View>
      </View>
      <View style={globalStyle.separator} />
    </>
  )
}

const createStyles = theme =>
  StyleSheet.create({
    informationMessage: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: Spacing.two,
      marginHorizontal: Spacing.three,
      marginVertical: Spacing.two
    },
    input: {
      color: '#2b3a4a',
      flex: 1,
      fontFamily: Fonts.sans,
      fontSize: 17,
      paddingVertical: 0
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
    }
  })
