import { CloseButton } from '@components/Buttons/CloseButton'
import { ThemedText } from '@components/Elements/Text'
import { StyleSheet, TextInput, View } from 'react-native'
import { useTheme } from '@hooks/use-theme'
import { BackButton } from '@components/Buttons/BackButton'
import { SeaFrontsSelector } from '@components/SeaFrontsSelector'
import { type SyncRegulatoryAreasOptions } from '@features/RegulatoryAreas/useCases/syncRegulatoryAreasDB'
import { useMMKVString } from 'react-native-mmkv'
import { useMemo, useRef, useState } from 'react'
import { storage } from '@storage'
import { parseSeaFronts } from '@utils/parseSeaFronts'
import { Image } from 'expo-image'
import { Spacing } from '@constants/theme'
import { SafeAreaView } from 'react-native-safe-area-context'

type SeaFrontsProps = {
  closeSettings: () => void
  closeSeaFrontSelector: () => void
  setIsRefreshingData: (value: boolean) => void
  refreshData: (options: SyncRegulatoryAreasOptions) => Promise<void>
}
export const SeaFronts = ({
  closeSettings,
  closeSeaFrontSelector,
  setIsRefreshingData,
  refreshData
}: SeaFrontsProps) => {
  const theme = useTheme()
  const [selectedSeaFronts, setSelectedSeaFronts] = useMMKVString('selectedSeaFronts', storage)
  const initialSelectionRef = useRef<string>(selectedSeaFronts)

  const [searchQuery, setSearchQuery] = useState('')

  const selectedSeaFrontsArray = useMemo(() => parseSeaFronts(selectedSeaFronts), [selectedSeaFronts])

  const triggerSyncIfNeeded = () => {
    if (selectedSeaFronts === initialSelectionRef.current) {
      setIsRefreshingData(false)
      return
    }

    initialSelectionRef.current = selectedSeaFronts
    setIsRefreshingData(true)
    refreshData({ forceRefresh: true, syncFish: false })
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
    closeSeaFrontSelector()
  }

  const onCloseSettings = () => {
    triggerSyncIfNeeded()
    closeSettings()
  }

  return (
    <SafeAreaView style={[styles.wrapper, { backgroundColor: theme.white }]}>
      <View style={styles.header}>
        <BackButton onBack={onCloseSeaFrontSelector} />
        <ThemedText type="default">Façades</ThemedText>
        <CloseButton onClose={onCloseSettings} />
      </View>
      <View style={[styles.searchBox, { backgroundColor: theme.gainsboro, borderColor: theme.lightGray }]}>
        <TextInput style={styles.input} value={searchQuery} onChangeText={setSearchQuery} />

        <Image source={require('@assets/icons/search.svg')} style={styles.icon} />
      </View>
      <SeaFrontsSelector
        searchQuery={searchQuery}
        selectedSeaFronts={selectedSeaFrontsArray}
        onToggle={onToggleSeaFront}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: Spacing.four
  },
  icon: {
    height: 20,
    paddingLeft: Spacing.two,
    width: 20
  },
  input: {
    color: '#2b3a4a',
    flex: 1,
    fontSize: 17,
    paddingVertical: 0
  },
  searchBox: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    height: 48,
    marginBottom: Spacing.four,
    paddingRight: Spacing.two
  },
  wrapper: {
    flex: 1,
    gap: Spacing.four,
    padding: Spacing.four
  }
})
