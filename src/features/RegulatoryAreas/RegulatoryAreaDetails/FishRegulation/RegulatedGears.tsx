import { MarkdownText } from '@components/Elements/MarkdownText'
import { ThemedText } from '@components/Elements/Text'
import type {
  Gear,
  GearCategory,
  RegulatedGears as RegulatedGearsType
} from '@domain/entities/regulatoryAreas/FishRegulation'
import { useTheme } from '@hooks/use-theme'
import { View } from 'react-native'
import {
  CATEGORY_LABEL,
  getGearCategoryRows,
  PASSIVE_GEARS_INFO,
  TOWED_GEARS_INFO
} from '../../utils/fishRegulation/gearCategories'
import { getMeshLabel } from '../../utils/fishRegulation/regulatoryContent'
import { styles } from '../style'
import { SectionTitle } from './SectionTitle'

export function RegulatedGears({
  authorized,
  regulatedGears
}: {
  authorized: boolean
  regulatedGears: RegulatedGearsType
}) {
  const theme = useTheme()
  const { allGears, allPassiveGears, allTowedGears, derogation } = regulatedGears

  return (
    <View style={styles.regulationBlock}>
      <SectionTitle authorized={authorized}>{`Engins ${authorized ? 'réglementés' : 'interdits'}`}</SectionTitle>
      {allGears ? (
        <ThemedText type="default" style={styles.horizontalPadding}>
          Tous les engins
        </ThemedText>
      ) : (
        <View style={styles.regulationList}>
          {!!allTowedGears && (
            <View style={styles.horizontalPadding}>
              <ThemedText type="default">Tous les engins traînants</ThemedText>
              <ThemedText type="small" themeColor="slateGray">
                {TOWED_GEARS_INFO}
              </ThemedText>
            </View>
          )}
          {!!allPassiveGears && (
            <View style={styles.horizontalPadding}>
              <ThemedText type="default">Tous les engins dormants</ThemedText>
              <ThemedText type="small" themeColor="slateGray">
                {PASSIVE_GEARS_INFO}
              </ThemedText>
            </View>
          )}
          {getGearCategoryRows(regulatedGears).map(row => (
            <View key={row.name} style={styles.horizontalPadding}>
              {!!row.name && <ThemedText type="defaultBold">{row.name}</ThemedText>}
              {row.category ? (
                <GearFields label={CATEGORY_LABEL[row.name]} gearOrCategory={row.category} />
              ) : (
                row.gears.map(gear => (
                  <GearFields
                    key={gear.code}
                    label={gear.name ? `${gear.code} (${gear.name})` : gear.code}
                    gearOrCategory={gear}
                  />
                ))
              )}
            </View>
          ))}
        </View>
      )}
      {!authorized && !!derogation && (
        <View style={[styles.derogation, { borderColor: theme.goldenPoppy }]}>
          <ThemedText type="small" themeColor="slateGray">
            Mesures dérogatoires : consulter les références réglementaires
          </ThemedText>
        </View>
      )}
    </View>
  )
}

function GearFields({ gearOrCategory, label }: { gearOrCategory: Gear | GearCategory; label: string | undefined }) {
  const meshLabel = getMeshLabel(gearOrCategory)

  return (
    <>
      {!!label && <ThemedText type="default">{label}</ThemedText>}
      {!!meshLabel && (
        <ThemedText type="default" style={styles.indented}>
          {meshLabel}
        </ThemedText>
      )}
      {!!gearOrCategory.remarks && <MarkdownText style={styles.indented} value={gearOrCategory.remarks} />}
    </>
  )
}
