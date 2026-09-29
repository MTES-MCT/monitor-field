import { MarkdownText } from '@components/Elements/MarkdownText'
import { ThemedText } from '@components/Elements/Text'
import type { RegulatedSpecies as RegulatedSpeciesType } from '@domain/entities/regulatoryAreas/FishRegulation'
import { View } from 'react-native'
import { styles } from '../style'
import { SectionTitle } from './SectionTitle'

export function RegulatedSpecies({
  authorized,
  regulatedSpecies
}: {
  authorized: boolean
  regulatedSpecies: RegulatedSpeciesType
}) {
  const { allSpecies, species, speciesGroups } = regulatedSpecies

  return (
    <View style={styles.regulationBlock}>
      <SectionTitle authorized={authorized}>{`Espèces ${authorized ? 'réglementées' : 'interdites'}`}</SectionTitle>
      {allSpecies ? (
        <ThemedText type="default" style={styles.horizontalPadding}>
          Toutes les espèces
        </ThemedText>
      ) : (
        <View style={styles.regulationList}>
          {species.map(({ code, name, remarks }, index) => (
            <View key={`${index}-${code}`} style={styles.horizontalPadding}>
              <ThemedText type="default">{name ? `${code} (${name})` : code}</ThemedText>
              {!!remarks && <MarkdownText style={styles.indented} value={remarks} />}
            </View>
          ))}
          {speciesGroups.map((group, index) => (
            <ThemedText key={`${index}-${group}`} type="default" style={styles.horizontalPadding}>
              {group}
            </ThemedText>
          ))}
        </View>
      )}
    </View>
  )
}
