import { CloseButton } from '@components/Buttons/CloseButton'
import { ThemedText } from '@components/Elements/Text'
import { StyleSheet, TextInput, View } from 'react-native'
import { BackButton } from '@components/Buttons/BackButton'
import { SeaFrontsSelector } from '@components/SeaFrontsSelector'
import { useMMKVString } from 'react-native-mmkv'
import { useMemo, useRef, useState } from 'react'
import { storage } from '@storage'
import { parseSeaFronts } from '@utils/parseSeaFronts'
import { Spacing } from '@constants/theme'
import useMatomo from '@matomo/useMatomo'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useGlobalStyle } from '@globalStyle'
import { useThemedStyles } from '@hooks/use-themed-styles'
import { useRouter } from 'expo-router'
import { useAppContext } from '@contexts/AppContext'
import { syncRegulatoryAreas } from '@features/RegulatoryAreas/useCases/syncRegulatoryAreas'
import { SearchInput } from '@components/SearchInput'

export default function SeaFronts() {
  const inputRef = useRef<TextInput | null>(null)
  const styles = useThemedStyles(createStyles)
  const globalStyle = useGlobalStyle()
  const router = useRouter()
  const { trackEvent } = useMatomo()
  const { isRefreshingSettingsData, setIsRefreshingSettingsData } = useAppContext()

  const [selectedSeaFronts, setSelectedSeaFronts] = useMMKVString('selectedSeaFronts', storage)
  const initialSelectionRef = useRef<string>(selectedSeaFronts)

  const [searchQuery, setSearchQuery] = useState('')

  const selectedSeaFrontsArray = useMemo(() => parseSeaFronts(selectedSeaFronts), [selectedSeaFronts])

  const triggerSyncIfNeeded = async () => {
    if (selectedSeaFronts === initialSelectionRef.current) {
      setIsRefreshingSettingsData(false)
      return
    }

    initialSelectionRef.current = selectedSeaFronts

    if (isRefreshingSettingsData) {
      return
    }
    setIsRefreshingSettingsData(true)

    try {
      await syncRegulatoryAreas(selectedSeaFrontsArray, { forceRefresh: true })
    } finally {
      setIsRefreshingSettingsData(false)
    }
  }

  const onToggleSeaFront = (newSelection: string) => {
    const currentSelection = parseSeaFronts(selectedSeaFronts)
    const updatedSelection = currentSelection.includes(newSelection)
      ? currentSelection.filter(seaFront => seaFront !== newSelection)
      : [...currentSelection, newSelection]

    setSelectedSeaFronts(updatedSelection.join(','))
  }

  const onCloseSeaFrontSelector = () => {
    triggerSyncIfNeeded()
    trackEvent({
      action: 'Mise à jour des façades',
      category: 'Façades',
      name: (selectedSeaFrontsArray ?? []).sort().join(', ')
    })

    router.back()
  }

  const onCloseSettings = () => {
    triggerSyncIfNeeded()
    router.dismissAll()
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={globalStyle.pageHeader}>
        <BackButton onBack={onCloseSeaFrontSelector} />
        <ThemedText type="default">Façades</ThemedText>
        <CloseButton onClose={onCloseSettings} />
      </View>
      <SearchInput
        ref={inputRef}
        searchText={searchQuery}
        onChangeText={setSearchQuery}
        onClearText={() => setSearchQuery('')}
        withBackButton={false}
        style={{ flex: 0, marginHorizontal: Spacing.four }}
        isLight={false}
      />

      <View style={styles.seaFrontWrapper}>
        <SeaFrontsSelector
          searchQuery={searchQuery}
          selectedSeaFronts={selectedSeaFrontsArray}
          onToggle={onToggleSeaFront}
        />
      </View>
    </SafeAreaView>
  )
}

const createStyles = theme => {
  return StyleSheet.create({
    seaFrontWrapper: {
      flex: 1,
      paddingHorizontal: Spacing.four,
      paddingVertical: Spacing.three
    },
    styledSearchBox: {
      backgroundColor: theme.gainsboro,
      flex: 0,
      marginBottom: Spacing.four,
      marginHorizontal: Spacing.four
    },
    wrapper: {
      backgroundColor: theme.white,
      flex: 1,
      gap: Spacing.four,
      padding: Spacing.four
    }
  })
}
