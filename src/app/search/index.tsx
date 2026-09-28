import { SafeAreaView } from 'react-native-safe-area-context'
import { useAppContext } from '@contexts/AppContext'
import { useGlobalStyle } from '@globalStyle'
import { useRegulatoryAreasContext } from '@contexts/RegulatoryAreasContext'
import { useRouter } from 'expo-router'
import { SearchInput } from '@features/Search/SearchInput'
import { View } from 'react-native'
import { Spacing } from '@constants/theme'
import { useState, useMemo } from 'react'
import { Image } from 'expo-image'
import { ThemedText } from '@components/Elements/Text'

export default function SearchPage() {
  const router = useRouter()
  const { filters, setFilters } = useRegulatoryAreasContext()
  const { config, setActiveModal } = useAppContext()
  const globalStyle = useGlobalStyle()

  const searchQuery = useMemo(() => {
    return config.mode === 'MONITORENV'
      ? (filters.searchQueryEnv?.trim() ?? undefined)
      : (filters.searchQueryFish?.trim() ?? undefined)
  }, [config.mode, filters.searchQueryEnv, filters.searchQueryFish])

  const [text, setText] = useState(searchQuery ?? '')

  const onDismiss = () => {
    setFilters(currentFilters => ({
      ...currentFilters,
      ...(config.mode === 'MONITORENV' ? { searchQueryEnv: undefined } : { searchQueryFish: undefined })
    }))
    router.back()
    setActiveModal(undefined)
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SearchInput onClose={onDismiss} text={text} setText={setText} />
      <View style={{ flex: 1, flexDirection: 'row', gap: Spacing.two, paddingHorizontal: Spacing.four }}>
        <Image source={require('@assets/icons/search.svg')} style={globalStyle.iconSmall} />
        <ThemedText type="default">{text}</ThemedText>
      </View>
    </SafeAreaView>
  )
}
