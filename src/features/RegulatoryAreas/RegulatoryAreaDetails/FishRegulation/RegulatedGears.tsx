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
  type GearCategoryRow,
  getGearCategoryRows,
  PASSIVE_GEARS_INFO,
  TOWED_GEARS_INFO,
  UNCATEGORIZED
} from '../../utils/fishRegulation/gearCategories'
import { formatCodeAndName, getMeshLabel } from '../../utils/fishRegulation/regulationLabels'
import { styles } from '../style'
import { type RegulationStatus, SectionTitle } from './SectionTitle'

export function RegulatedGears({
  regulatedGears,
  status
}: {
  regulatedGears: RegulatedGearsType
  status: RegulationStatus
}) {
  const theme = useTheme()
  const { allGears, allPassiveGears, allTowedGears, derogation } = regulatedGears

  return (
    <View style={styles.regulationBlock}>
      <SectionTitle status={status}>{`Engins ${status === 'authorized' ? 'réglementés' : 'interdits'}`}</SectionTitle>
      {allGears ? (
        <ThemedText type="default" style={styles.horizontalPadding}>
          Tous les engins
        </ThemedText>
      ) : (
        <View style={styles.regulationList}>
          {!!allTowedGears && <GearGroupRow label="Tous les engins traînants" info={TOWED_GEARS_INFO} />}
          {!!allPassiveGears && <GearGroupRow label="Tous les engins dormants" info={PASSIVE_GEARS_INFO} />}
          {getGearCategoryRows(regulatedGears).map(row => (
            <GearCategoryBlock key={row.name} row={row} />
          ))}
        </View>
      )}
      {status === 'forbidden' && !!derogation && (
        <View style={[styles.derogation, { borderColor: theme.goldenPoppy }]}>
          <ThemedText type="small" themeColor="slateGray">
            Mesures dérogatoires : consulter les références réglementaires
          </ThemedText>
        </View>
      )}
    </View>
  )
}

function GearGroupRow({ info, label }: { info: string; label: string }) {
  return (
    <View style={styles.horizontalPadding}>
      <ThemedText type="default">{label}</ThemedText>
      <ThemedText type="small" themeColor="slateGray">
        {info}
      </ThemedText>
    </View>
  )
}

function GearCategoryBlock({ row: { category, gears, name } }: { row: GearCategoryRow }) {
  return (
    <View style={styles.horizontalPadding}>
      {name !== UNCATEGORIZED && <ThemedText type="defaultBold">{name}</ThemedText>}
      {category ? (
        <GearFields label={CATEGORY_LABEL[name]} gearOrCategory={category} />
      ) : (
        gears.map((gear, index) => (
          <GearFields
            key={`${index}-${gear.code}`}
            label={formatCodeAndName(gear.code, gear.name)}
            gearOrCategory={gear}
          />
        ))
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
