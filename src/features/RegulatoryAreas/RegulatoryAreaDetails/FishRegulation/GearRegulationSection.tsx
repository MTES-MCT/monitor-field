import {
  type GearRegulation,
  hasGearRegulation,
  hasRegulatedGears
} from '@domain/entities/regulatoryAreas/FishRegulation'
import { RegulatedGears } from './RegulatedGears'
import { RegulationSection } from './RegulationSection'

export function GearRegulationSection({ gearRegulation }: { gearRegulation: GearRegulation | undefined }) {
  if (!hasGearRegulation(gearRegulation)) {
    return null
  }

  const { authorized, otherInfo, unauthorized } = gearRegulation

  return (
    <RegulationSection otherInfo={otherInfo}>
      {hasRegulatedGears(authorized) && <RegulatedGears status="authorized" regulatedGears={authorized} />}
      {hasRegulatedGears(unauthorized) && <RegulatedGears status="forbidden" regulatedGears={unauthorized} />}
    </RegulationSection>
  )
}
