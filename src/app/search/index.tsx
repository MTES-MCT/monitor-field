import { SafeAreaView } from 'react-native-safe-area-context'
import { useCurrentRouteInfo, useRouter } from 'expo-router'
import { useAppContext } from '@contexts/AppContext'
import { useGlobalStyle } from '@globalStyle'
import { useRegulatoryAreasContext } from '@contexts/RegulatoryAreasContext'
import { Pressable, StyleSheet, TextInput, View } from 'react-native'
import { Spacing } from '@constants/theme'
import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { Image } from 'expo-image'
import { ThemedText } from '@components/Elements/Text'
import useMatomo from '@matomo/useMatomo'
import { useBackHandler } from '@hooks/useBackHandler'
import { SearchInput } from '@components/SearchInput'

export default function SearchPage() {
  const inputRef = useRef<TextInput | null>(null)

  const router = useRouter()
  const currentRouteInfo = useCurrentRouteInfo()
  const { filters, setFilters } = useRegulatoryAreasContext()
  const { config, setActiveModal } = useAppContext()
  const globalStyle = useGlobalStyle()
  const { trackScreenView } = useMatomo()

  const searchQuery = useMemo(() => {
    return config.mode === 'MONITORENV'
      ? (filters.searchQueryEnv?.trim() ?? undefined)
      : (filters.searchQueryFish?.trim() ?? undefined)
  }, [config.mode, filters.searchQueryEnv, filters.searchQueryFish])

  const [text, setText] = useState(searchQuery ?? '')

  const closePage = () => {
    inputRef.current?.blur()
    router.back()
    if (currentRouteInfo?.params?.origin === 'REGULATORY_AREAS_LIST_MODAL') {
      setActiveModal('REGULATORY_AREAS_LIST_MODAL')

      return
    }
    setActiveModal(undefined)
  }

  const submitResearch = useCallback(() => {
    const trimmedText = text?.trim()
    setFilters(currentFilters => ({
      ...currentFilters,
      ...(config.mode === 'MONITORENV'
        ? { searchQueryEnv: trimmedText ?? undefined }
        : { searchQueryFish: trimmedText ?? undefined })
    }))

    setActiveModal('REGULATORY_AREAS_LIST_MODAL')

    router.back()
  }, [text, config.mode, setFilters, setActiveModal, router])

  const changeText = (newText: string) => {
    setText(newText)
  }

  const clearText = () => {
    setText('')
    setFilters(currentFilters => ({
      ...currentFilters,
      ...(config.mode === 'MONITORENV' ? { searchQueryEnv: undefined } : { searchQueryFish: undefined })
    }))
  }

  useBackHandler(closePage, currentRouteInfo?.pathname.includes('/search'))

  useEffect(() => {
    trackScreenView({ name: 'Page Recherche' })
  }, [trackScreenView])

  return (
    <SafeAreaView style={styles.wrapper}>
      <SearchInput
        ref={inputRef}
        onClose={closePage}
        searchText={text}
        onChangeText={changeText}
        onSubmit={submitResearch}
        onClearText={clearText}
        autoFocus
        style={{ flex: 0, marginHorizontal: Spacing.four }}
      />
      <View style={styles.informationMessage}>
        <Image source={require('@assets/icons/attention-filled.svg')} style={globalStyle.iconSmall} />
        <ThemedText type="small" themeColor="slateGray">
          La recherche se fait dans la zone à l’écran
        </ThemedText>
      </View>
      <View style={globalStyle.separator} />
      <View style={styles.searchListWrapper}>
        {text.length > 0 && (
          <Pressable onPress={submitResearch} style={styles.searchItem}>
            <Image source={require('@assets/icons/search.svg')} style={globalStyle.iconSmall} />
            <ThemedText type="default">{text}</ThemedText>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  informationMessage: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four
  },
  searchItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.two
  },
  searchListWrapper: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four
  },
  wrapper: {
    flex: 1,
    gap: Spacing.two,
    paddingTop: Spacing.four
  }
})
