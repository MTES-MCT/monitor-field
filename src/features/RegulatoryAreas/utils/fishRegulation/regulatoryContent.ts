import type {
  Gear,
  GearCategory,
  RegulatedGears,
  RegulatedSpecies,
  RegulatoryReference,
  RegulatoryTextType
} from '@domain/entities/regulatoryAreas/FishRegulation'

export function regulatedGearsIsNotEmpty(regulatedGears: RegulatedGears | undefined): regulatedGears is RegulatedGears {
  return (
    !!regulatedGears &&
    (!!regulatedGears.allGears ||
      !!regulatedGears.allTowedGears ||
      !!regulatedGears.allPassiveGears ||
      Object.keys(regulatedGears.regulatedGears).length > 0 ||
      Object.keys(regulatedGears.regulatedGearCategories).length > 0 ||
      !!regulatedGears.derogation)
  )
}

export function regulatedSpeciesIsNotEmpty(
  regulatedSpecies: RegulatedSpecies | undefined
): regulatedSpecies is RegulatedSpecies {
  return (
    !!regulatedSpecies &&
    (!!regulatedSpecies.allSpecies || regulatedSpecies.species.length > 0 || regulatedSpecies.speciesGroups.length > 0)
  )
}

const TEXT_TYPE_LABEL: Record<RegulatoryTextType, string> = {
  creation: 'Création',
  regulation: 'Réglementation'
}

export function getRegulatoryTextTypeLabel(textTypes: RegulatoryTextType[]): string | undefined {
  const labels = textTypes.map(textType => TEXT_TYPE_LABEL[textType]).filter(Boolean)
  if (labels.length === 0) {
    return undefined
  }

  const [first, ...rest] = labels

  return `${[first, ...rest.map(label => label.toLowerCase())].join(' et ')} de zone`
}

export function getMeshLabel({ mesh, meshType }: Gear | GearCategory): string | undefined {
  if (!mesh?.length) {
    return undefined
  }

  const [min, max] = mesh
  switch (meshType) {
    case 'greaterThanOrEqualTo':
      return `Maillage supérieur ou égal à ${min} mm`
    case 'lowerThan':
      return `Maillage inférieur à ${min} mm`
    case 'lowerThanOrEqualTo':
      return `Maillage inférieur ou égal à ${min} mm`
    case 'equal':
      return `Maillage égal à ${min} mm`
    case 'between':
      return `Maillage entre ${min} et ${max} mm`
    default:
      return `Maillage supérieur à ${min} mm`
  }
}

export function isReferenceOutdated({ endDate }: RegulatoryReference, today: Date = new Date()): boolean {
  if (!endDate || endDate === 'infinite') {
    return false
  }

  const end = new Date(endDate)

  return !Number.isNaN(end.getTime()) && end < today
}
