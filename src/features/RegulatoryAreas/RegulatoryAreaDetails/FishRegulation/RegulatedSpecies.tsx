import { MarkdownText } from '@components/Elements/MarkdownText'
import { HighlightedText } from '@components/Elements/HighlightedText'
import type { RegulatedSpecies as RegulatedSpeciesType } from '@domain/entities/regulatoryAreas/FishRegulation'
import { View } from 'react-native'
import { formatCodeAndName } from '../../utils/fishRegulation/regulationLabels'
import { styles } from '../style'
import { type RegulationStatus, SectionTitle } from './SectionTitle'
import { useFishSearchQuery } from './useFishSearchQuery'

export function RegulatedSpecies({
  regulatedSpecies,
  status
}: {
  regulatedSpecies: RegulatedSpeciesType
  status: RegulationStatus
}) {
  const searchQuery = useFishSearchQuery()
  const { allSpecies, species, speciesGroups } = regulatedSpecies

  return (
    <View style={styles.regulationBlock}>
      <SectionTitle status={status}>
        {`Espèces ${status === 'authorized' ? 'réglementées' : 'interdites'}`}
      </SectionTitle>
      {allSpecies ? (
        <HighlightedText type="default" style={styles.horizontalPadding} searchQuery={searchQuery}>
          Toutes les espèces
        </HighlightedText>
      ) : (
        <View style={styles.regulationList}>
          {species.map(({ code, name, remarks }, index) => (
            <View key={`${index}-${code}`} style={styles.horizontalPadding}>
              <HighlightedText type="default" searchQuery={searchQuery}>
                {formatCodeAndName(code, name)}
              </HighlightedText>
              {!!remarks && <MarkdownText style={styles.indented} value={remarks} searchQuery={searchQuery} />}
            </View>
          ))}
          {speciesGroups.map((group, index) => (
            <HighlightedText
              key={`${index}-${group}`}
              type="default"
              style={styles.horizontalPadding}
              searchQuery={searchQuery}
            >
              {group}
            </HighlightedText>
          ))}
        </View>
      )}
    </View>
  )
}
