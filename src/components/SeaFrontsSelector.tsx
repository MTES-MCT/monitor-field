import { ScrollView } from 'react-native-gesture-handler'
import { MultiCheckbox } from './Elements/MultiCheckbox'
import { normalizeText } from '@/utils/normalizeText'
import type { Accent } from '@constants/theme'
import { useMemo } from 'react'

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
  accent?: Accent
  selectedSeaFronts: string[]
  searchQuery?: string
  onToggle: (seaFront: string) => void
}

export function SeaFrontsSelector({ accent, selectedSeaFronts, onToggle, searchQuery }: SeaFrontsSelectorProps) {
  const filteredSeaFrontOptions = useMemo(
    () =>
      seaFrontOptions.filter(option =>
        searchQuery ? normalizeText(option.label).includes(normalizeText(searchQuery)) : true
      ),
    [searchQuery]
  )

  return (
    <ScrollView>
      {filteredSeaFrontOptions.map(option => (
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
