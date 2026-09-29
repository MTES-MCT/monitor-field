import { BackButton } from '@components/Buttons/BackButton'
import { CloseButton } from '@components/Buttons/CloseButton'
import { Spacing } from '@constants/theme'
import { useRegulatoryAreasContext } from '@contexts/RegulatoryAreasContext'
import { useAppContext } from '@contexts/AppContext'
import { useGlobalStyle } from '@globalStyle'
import { Image } from 'expo-image'
import { useCallback, useRef } from 'react'
import { StyleSheet, TextInput, View } from 'react-native'
import { useRouter } from 'expo-router'
import { ThemedText } from '@components/Elements/Text'

type SearchInputProps = {
  onClose: () => void
  text?: string
  setText: (text: string) => void
}

export function SearchInput({ onClose, text, setText }: SearchInputProps) {
  const router = useRouter()
  const inputRef = useRef<TextInput>(null)
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

    setActiveModal('REGULATORY_AREAS_LIST_MODAL')

    router.back()
  }, [setActiveModal, router, text, config.mode, setFilters])

  return (
    <>
      <View style={{ flexDirection: 'row', paddingHorizontal: Spacing.three }}>
        <View style={globalStyle.searchBox}>
          <BackButton onBack={onCloseSearchInput} style={{ marginLeft: Spacing.two }} />

          <TextInput
            ref={inputRef}
            autoFocus
            style={globalStyle.input}
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
      <View style={styles.informationMessage}>
        <Image source={require('@assets/icons/attention-filled.svg')} style={globalStyle.iconSmall} />
        <ThemedText type="small" themeColor="slateGray">
          La recherche se fait dans la zone à l’écran
        </ThemedText>
      </View>
      <View style={globalStyle.separator} />
    </>
  )
}

const styles = StyleSheet.create({
  informationMessage: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.two,
    marginHorizontal: Spacing.two,
    marginVertical: Spacing.two
  }
})
