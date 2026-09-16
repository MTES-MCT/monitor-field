import { CloseButton } from '@components/Buttons/CloseButton'
import { ThemedText } from '@components/Elements/Text'
import { StyleSheet, TextInput, View } from 'react-native'
import { BackButton } from '@components/Buttons/BackButton'
import { SeaFrontsSelector } from '@components/SeaFrontsSelector'
import { useMMKVString } from 'react-native-mmkv'
import { useMemo, useRef, useState } from 'react'
import { storage } from '@storage'
import { parseSeaFronts } from '@utils/parseSeaFronts'
import { Image } from 'expo-image'
import { Spacing } from '@constants/theme'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useGlobalStyle } from '@globalStyle'
import { useThemedStyles } from '@hooks/use-themed-styles'
import { useRouter } from 'expo-router'
import { useAppContext } from '@contexts/AppContext'
import { syncRegulatoryAreas } from '@features/RegulatoryAreas/useCases/syncRegulatoryAreas'

export default function SeaFronts() {
  const styles = useThemedStyles(createStyles)
  const globalStyle = useGlobalStyle()
  const router = useRouter()
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
    router.back()
  }

  const onCloseSettings = () => {
    triggerSyncIfNeeded()
    router.dismissAll()
  }

  return (
    <SafeAreaView style={{ flex: 1, paddingBottom: Spacing.six }}>
      <View style={globalStyle.pageHeader}>
        <BackButton onBack={onCloseSeaFrontSelector} />
        <ThemedText type="default">Façades</ThemedText>
        <CloseButton onClose={onCloseSettings} />
      </View>
      <View style={[globalStyle.searchBox, styles.styledSearchBox]}>
        <TextInput style={styles.input} value={searchQuery} onChangeText={setSearchQuery} />

        <Image
          source={require('@assets/icons/search.svg')}
          style={[globalStyle.iconNormal, { paddingLeft: Spacing.two }]}
        />
      </View>
      <View style={{ paddingBottom: 120, paddingHorizontal: Spacing.four }}>
        <SeaFrontsSelector
          searchQuery={searchQuery}
          selectedSeaFronts={selectedSeaFrontsArray}
          onToggle={onToggleSeaFront}
        />
      </View>
    </SafeAreaView>
  )
}

const createStyles = theme =>
  StyleSheet.create({
    input: {
      color: '#2b3a4a',
      flex: 1,
      fontSize: 17,
      paddingVertical: 0
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
