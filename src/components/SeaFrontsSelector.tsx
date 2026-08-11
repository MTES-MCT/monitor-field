import { ScrollView } from 'react-native-gesture-handler'
import { MultiCheckbox } from './Elements/MultiCheckbox'
import { StyleSheet } from 'react-native'
import type { ThemeColor } from '@constants/theme'

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

type SeaFrontsSelectorProps = {
  accent?: 'PRIMARY' | 'SECONDARY'
  labelColor?: ThemeColor
  selectedSeaFronts: string[]
  onToggle: (seaFront: string) => void
}

export function SeaFrontsSelector({ accent, selectedSeaFronts, onToggle }: SeaFrontsSelectorProps) {
  return (
    <ScrollView style={styles.checkboxWrapper}>
      {seaFrontOptions.map(option => (
        <MultiCheckbox
          key={option.value}
          label={option.label}
          isChecked={selectedSeaFronts.includes(option.value)}
          onToggle={() => onToggle(option.value)}
          accent={accent}
        />
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  checkboxWrapper: {
    flex: 1
  }
})
