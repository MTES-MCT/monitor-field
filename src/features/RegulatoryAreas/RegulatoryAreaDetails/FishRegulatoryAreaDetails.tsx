import type { FishRegulatoryAreaSummary } from '@domain/entities/regulatoryAreas/RegulatoryAreaSummary'
import { memo } from 'react'
import { View } from 'react-native'
import { getRegulatoryAreaLabel } from '../utils/getRegulatoryAreaLabel'
import { ContactFooter } from './ContactFooter'
import { DetailsHeader } from './DetailsHeader'
import { FishingPeriodSection } from './FishRegulation/FishingPeriodSection'
import { GearRegulationSection } from './FishRegulation/GearRegulationSection'
import { GeneralRemarksSection } from './FishRegulation/GeneralRemarksSection'
import { OutdatedReferencesWarning } from './FishRegulation/OutdatedReferencesWarning'
import { RegulationTypeSection } from './FishRegulation/RegulationTypeSection'
import { SpeciesRegulationSection } from './FishRegulation/SpeciesRegulationSection'
import { styles } from './style'

const CNSP_TEL_NUMBER = process.env.EXPO_PUBLIC_CNSP_NUMBER

function FishRegulatoryAreaDetailsComponent({
  color,
  regulatoryArea,
  onDismiss
}: {
  color: string
  regulatoryArea: FishRegulatoryAreaSummary
  onDismiss: () => void
}) {
  const { regulation } = regulatoryArea

  return (
    <>
      <DetailsHeader
        color={color}
        onDismiss={onDismiss}
        subtitle={regulatoryArea.theme}
        title={getRegulatoryAreaLabel(regulatoryArea, 'MONITORFISH')}
      />
      <OutdatedReferencesWarning regulatoryReferences={regulation.regulatoryReferences} />
      <View style={styles.content}>
        <FishingPeriodSection fishingPeriod={regulation.fishingPeriod} />
        <GearRegulationSection gearRegulation={regulation.gearRegulation} />
        <SpeciesRegulationSection speciesRegulation={regulation.speciesRegulation} />
        <GeneralRemarksSection generalRemarks={regulation.generalRemarks} />
        <RegulationTypeSection type={regulatoryArea.type} regulatoryReferences={regulation.regulatoryReferences} />
        <ContactFooter phoneNumber={CNSP_TEL_NUMBER} serviceName="CNSP" />
      </View>
    </>
  )
}

export const FishRegulatoryAreaDetails = memo(FishRegulatoryAreaDetailsComponent)
