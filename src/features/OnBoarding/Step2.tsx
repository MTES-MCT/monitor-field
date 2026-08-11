import { ThemedText } from '@components/Elements/Text'
import { Pressable, StyleSheet, View } from 'react-native'
import { useState } from 'react'
import { useTheme } from '@hooks/use-theme'
import { Image } from 'expo-image'
import { Spacing } from '@constants/theme'
import { SeaFrontsSelector } from '@components/SeaFrontsSelector'

export function Step2({ onNext }: { onNext: (facades: string[]) => void }) {
  const theme = useTheme()
  const [selectedSeaFronts, setSelectedSeaFronts] = useState<string[]>([])

  const isButtonDisabled = selectedSeaFronts.length === 0

  const handleNextStep = () => {
    if (isButtonDisabled) {
      return
    }

    onNext(selectedSeaFronts)
  }

  const toggleSeaFront = (seaFront: string) => {
    setSelectedSeaFronts(prev => (prev.includes(seaFront) ? prev.filter(v => v !== seaFront) : [...prev, seaFront]))
  }

  return (
    <View style={styles.wrapper}>
      <ThemedText themeColor="white" type="title" style={styles.title}>
        Choix du secteur
      </ThemedText>
      <ThemedText themeColor="white" type="default">
        Veuillez sélectionner votre façade habituelle de mission. Vous pouvez en sélectionner plusieurs si vous
        intervenez sur plusieurs façades.
      </ThemedText>
      <ThemedText themeColor="white" type="defaultItalic">
        Vous pourrez changer ces informations plus tard dans les paramètres de l’application.
      </ThemedText>
      <SeaFrontsSelector accent="SECONDARY" selectedSeaFronts={selectedSeaFronts} onToggle={toggleSeaFront} />

      <Pressable
        disabled={isButtonDisabled}
        onPress={handleNextStep}
        accessibilityRole="button"
        accessibilityState={{
          disabled: isButtonDisabled
        }}
        style={[styles.button, { backgroundColor: isButtonDisabled ? theme.lightGray : theme.blueGray }]}
      >
        <ThemedText type="default" themeColor="white">
          Suivant
        </ThemedText>
        <Image source={require('@assets/icons/arrow-right.svg')} style={styles.arrowIcon} />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  arrowIcon: {
    height: 24,
    width: 24
  },
  button: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.two,
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: Spacing.six
  },
  checkboxWrapper: {
    flex: 1
  },
  title: {
    marginBottom: Spacing.four,
    textAlign: 'center'
  },
  wrapper: {
    alignItems: 'center',
    flex: 1,
    gap: Spacing.four,
    justifyContent: 'center',
    padding: 55,
    textAlign: 'center'
  }
})
