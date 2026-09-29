import type { Gear, GearCategory, RegulatoryTextType } from '@domain/entities/regulatoryAreas/FishRegulation'

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

export function formatCodeAndName(code: string, name: string | null | undefined): string {
  return name ? `${code} (${name})` : code
}
