import { CloseButton } from '@components/Buttons/CloseButton'
import { ThemedText } from '@components/Elements/Text'
import { StyleSheet, View } from 'react-native'
import { useTheme } from '@hooks/use-theme'
import { BackButton } from '@components/Buttons/BackButton'
import { SeaFrontsSelector } from '@components/SeaFrontsSelector'
import { useMMKVString } from 'react-native-mmkv'
import { storage } from '@storage'

export const SeaFronts = ({
  closeSettings,
  closeSeaFrontSelector
}: {
  closeSettings: () => void
  closeSeaFrontSelector: () => void
}) => {
  const theme = useTheme()
  const [selectedSeaFronts, setSelectedSeaFronts] = useMMKVString('selectedSeaFronts', storage)

  const onToggleSeaFront = (newSelection: string) => {
    if (selectedSeaFronts?.split(',').includes(newSelection)) {
      const updatedSelection = selectedSeaFronts
        ?.split(',')
        .filter(seaFront => seaFront !== newSelection)
        .join(',')
      setSelectedSeaFronts(updatedSelection)
    } else {
      const updatedSelection = selectedSeaFronts ? `${selectedSeaFronts},${newSelection}` : newSelection
      setSelectedSeaFronts(updatedSelection)
    }
  }
  return (
    <View style={[styles.wrapper, { backgroundColor: theme.white }]}>
      <View style={styles.header}>
        <BackButton onBack={closeSeaFrontSelector} />
        <ThemedText type="default">Façades</ThemedText>
        <CloseButton onClose={closeSettings} />
      </View>
      <SeaFrontsSelector
        labelColor="gunMetal"
        selectedSeaFronts={selectedSeaFronts?.split(',') ?? []}
        onToggle={onToggleSeaFront}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  wrapper: {
    flex: 1,
    flexGrow: 1,
    padding: 16
  }
})
