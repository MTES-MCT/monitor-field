import {
  hasRegulatedSpecies,
  hasSpeciesRegulation,
  type SpeciesRegulation
} from '@domain/entities/regulatoryAreas/FishRegulation'
import { RegulatedSpecies } from './RegulatedSpecies'
import { RegulationSection } from './RegulationSection'

export function SpeciesRegulationSection({ speciesRegulation }: { speciesRegulation: SpeciesRegulation | undefined }) {
  if (!hasSpeciesRegulation(speciesRegulation)) {
    return null
  }

  const { authorized, otherInfo, unauthorized } = speciesRegulation

  return (
    <RegulationSection otherInfo={otherInfo}>
      {hasRegulatedSpecies(authorized) && <RegulatedSpecies status="authorized" regulatedSpecies={authorized} />}
      {hasRegulatedSpecies(unauthorized) && <RegulatedSpecies status="forbidden" regulatedSpecies={unauthorized} />}
    </RegulationSection>
  )
}
