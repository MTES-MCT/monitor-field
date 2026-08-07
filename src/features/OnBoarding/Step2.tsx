import { ThemedText } from '@components/Text'
import { Pressable, StyleSheet, View, ScrollView } from 'react-native'
import { useState } from 'react'
import { useTheme } from '@hooks/use-theme'
import { Image } from 'expo-image'
import { Spacing } from '@constants/theme'
import { MultiCheckbox } from '@components/MultiCheckbox'

const seaFrontOptions = [
  { label: 'Clipperton', value: 'Clipperton' },
  { label: 'Guadeloupe', value: 'Guadeloupe' },
  { label: 'Guyane', value: 'Guyane' },
  { label: 'La Réunion', value: 'La Réunion' },
  { label: 'Martinique', value: 'Martinique' },
  { label: 'Mayotte', value: 'Mayotte' },
  { label: 'MED', value: 'MED' },
  { label: 'MEMN', value: 'MEMN' },
  { label: 'NAMO', value: 'NAMO' },
  { label: 'Nouvelle-Calédonie', value: 'Nouvelle-Calédonie' },
  { label: 'Océan Indien Hors ZEE', value: 'Océan Indien Hors ZEE' },
  { label: 'Polynésie Française', value: 'Polynésie Française' },
  { label: 'SA', value: 'SA' },
  { label: 'Saint-Barthélemy', value: 'Saint-Barthélemy' },
  { label: 'Saint-Martin', value: 'Saint-Martin' },
  { label: 'Saint-Pierre et Miquelon', value: 'Saint-Pierre et Miquelon' },
  { label: 'TAAF', value: 'TAAF' },
  { label: 'Wallis-et-Futuna', value: 'Wallis-et-Futuna' }
]

export function Step2({ setCurrentStep }: { setCurrentStep: () => void }) {
  const theme = useTheme()
  const [selectedSeaFronts, setSelectedSeaFronts] = useState<string[]>([])

  const isButtonDisabled = selectedSeaFronts.length === 0

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

      <ScrollView style={styles.checkboxWrapper}>
        {seaFrontOptions.map(option => (
          <MultiCheckbox
            key={option.value}
            label={option.label}
            isChecked={selectedSeaFronts.includes(option.value)}
            onToggle={() => {
              setSelectedSeaFronts(prev =>
                prev.includes(option.value) ? prev.filter(v => v !== option.value) : [...prev, option.value]
              )
            }}
          />
        ))}
      </ScrollView>

      <Pressable
        disabled={isButtonDisabled}
        onPress={setCurrentStep}
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
