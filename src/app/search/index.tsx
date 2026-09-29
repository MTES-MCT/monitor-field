import { SafeAreaView } from 'react-native-safe-area-context'
import { useCurrentRouteInfo, useRouter } from 'expo-router'
import { useAppContext } from '@contexts/AppContext'
import { useGlobalStyle } from '@globalStyle'
import { useRegulatoryAreasContext } from '@contexts/RegulatoryAreasContext'
import { SearchInput } from '@features/Search/SearchInput'
import { Pressable, View } from 'react-native'
import { Spacing } from '@constants/theme'
import { useState, useMemo, useEffect } from 'react'
import { Image } from 'expo-image'
import { ThemedText } from '@components/Elements/Text'
import useMatomo from '@matomo/useMatomo'
import { useBackHandler } from '@hooks/useBackHandler'

export default function SearchPage() {
  const router = useRouter()
  const currentRouteInfo = useCurrentRouteInfo()
  const { filters } = useRegulatoryAreasContext()
  const { config, setActiveModal } = useAppContext()
  const globalStyle = useGlobalStyle()
  const { trackScreenView } = useMatomo()

  const searchQuery = useMemo(() => {
    return config.mode === 'MONITORENV'
      ? (filters.searchQueryEnv?.trim() ?? undefined)
      : (filters.searchQueryFish?.trim() ?? undefined)
  }, [config.mode, filters.searchQueryEnv, filters.searchQueryFish])

  const [text, setText] = useState(searchQuery ?? '')

  const onDismiss = () => {
    router.back()
    if (currentRouteInfo?.params?.origin === 'REGULATORY_AREAS_LIST_MODAL') {
      setActiveModal('REGULATORY_AREAS_LIST_MODAL')
      return
    }
    setActiveModal(undefined)
  }
  useBackHandler(onDismiss, currentRouteInfo?.pathname === '/search')

  useEffect(() => {
    trackScreenView({ name: 'Page Recherche' })
  }, [trackScreenView])

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SearchInput onClose={onDismiss} text={text} setText={setText} />
      <View style={{ flex: 1, flexDirection: 'row', gap: Spacing.two, paddingHorizontal: Spacing.four }}>
        {text.length > 0 && (
          <Pressable onPress={onDismiss} style={{ flexDirection: 'row', gap: Spacing.two }}>
            <Image source={require('@assets/icons/search.svg')} style={globalStyle.iconSmall} />
            <ThemedText type="default">{text}</ThemedText>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  )
}
