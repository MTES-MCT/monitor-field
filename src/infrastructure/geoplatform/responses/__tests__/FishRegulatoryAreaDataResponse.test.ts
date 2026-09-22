import { parseGeoJSONFeature } from '@utils/parseGeoJSONFeature'
import type { FishRegulatoryAreaFeature } from '../FishRegulatoryAreaDataResponse'
import { toFishRegulatoryArea } from '../FishRegulatoryAreaDataResponse'

const PROPERTIES = {
  engins: '{"regulatedGears": []}',
  especes: '{"regulatedSpecies": []}',
  periodes: '{"always": true}',
  reglementations: '[{"reference": "Arrêté Préfectoral R53-2024"}]',
  remarques_generales: 'Pêche interdite toute l’année',
  thematique: "Côtes d'Armor - CSJ",
  type_de_reglementation: 'Reg. NAMO',
  zone: 'Banc de Maërl'
}

function buildFeature(overrides: Partial<FishRegulatoryAreaFeature> = {}): FishRegulatoryAreaFeature {
  return {
    geometry: {
      coordinates: [
        [
          [
            [-3.4, 48.8],
            [-3.4, 48.9],
            [-3.3, 48.9],
            [-3.4, 48.8]
          ]
        ]
      ],
      type: 'MultiPolygon'
    },
    id: 'some_layer.12',
    properties: PROPERTIES,
    type: 'Feature',
    ...overrides
  } as FishRegulatoryAreaFeature
}

describe('toFishRegulatoryArea', () => {
  it('maps the wire column names onto the domain entity', () => {
    const area = toFishRegulatoryArea(buildFeature())

    expect(area).toMatchObject({
      fishingPeriods: '{"always": true}',
      gears: '{"regulatedGears": []}',
      generalRemarks: 'Pêche interdite toute l’année',
      id: 12,
      regulatoryReferences: '[{"reference": "Arrêté Préfectoral R53-2024"}]',
      species: '{"regulatedSpecies": []}',
      theme: "Côtes d'Armor - CSJ",
      type: 'Reg. NAMO',
      zone: 'Banc de Maërl'
    })
  })

  it('leaves the optional columns undefined when the delivery sends null', () => {
    const feature = buildFeature({
      properties: {
        ...PROPERTIES,
        engins: null,
        especes: null,
        periodes: null,
        reglementations: null,
        remarques_generales: null
      }
    } as Partial<FishRegulatoryAreaFeature>)

    expect(toFishRegulatoryArea(feature)).toMatchObject({
      fishingPeriods: undefined,
      gears: undefined,
      generalRemarks: undefined,
      regulatoryReferences: undefined,
      species: undefined
    })
  })

  it('serializes the geometry as a Feature, the shape the read path expects', () => {
    const area = toFishRegulatoryArea(buildFeature())

    expect(JSON.parse(area!.geometry!)).toEqual({
      geometry: buildFeature().geometry,
      properties: {},
      type: 'Feature'
    })
  })

  it('computes the bounding box', () => {
    expect(toFishRegulatoryArea(buildFeature())?.boundingBox).toEqual({
      maxLat: 48.9,
      maxLon: -3.3,
      minLat: 48.8,
      minLon: -3.4
    })
  })

  it('accepts a Polygon, which GeoServer emits for single-ring geometry', () => {
    const feature = buildFeature({
      geometry: {
        coordinates: [
          [
            [1, 1],
            [1, 2],
            [2, 2],
            [1, 1]
          ]
        ],
        type: 'Polygon'
      }
    })

    expect(toFishRegulatoryArea(feature)?.boundingBox).toEqual({ maxLat: 2, maxLon: 2, minLat: 1, minLon: 1 })
  })

  // The largest geometry in the published dataset.
  it('computes a bounding box for a geometry with 117 981 vertices', () => {
    const ring = Array.from({ length: 117_981 }, (_, index) => [-5 + (index % 1000) / 1000, 45 + (index % 500) / 1000])
    ring.push(ring[0]!)

    const area = toFishRegulatoryArea(buildFeature({ geometry: { coordinates: [[ring]], type: 'MultiPolygon' } }))

    expect(area?.boundingBox).toEqual({ maxLat: 45.499, maxLon: -4.001, minLat: 45, minLon: -5 })
  })

  // Longitude 0 crosses French waters, and a truthiness check would drop it.
  it('keeps a coordinate at exactly zero', () => {
    const feature = buildFeature({
      geometry: {
        coordinates: [
          [
            [0, 0],
            [0, 49],
            [2, 49],
            [0, 0]
          ]
        ],
        type: 'Polygon'
      }
    })

    expect(toFishRegulatoryArea(feature)?.boundingBox).toEqual({ maxLat: 49, maxLon: 2, minLat: 0, minLon: 0 })
  })

  it('keeps an area whose geometry is null, without a bounding box', () => {
    const area = toFishRegulatoryArea(buildFeature({ geometry: null }))

    expect(area).toMatchObject({ boundingBox: undefined, geometry: undefined, id: 12 })
  })

  it('returns undefined when the feature has no usable id', () => {
    expect(toFishRegulatoryArea(buildFeature({ id: 'some_layer.not-a-number' }))).toBeUndefined()
    expect(toFishRegulatoryArea(buildFeature({ id: undefined }))).toBeUndefined()
  })

  // Guards the seam that broke "Afficher les reg. ici": the mapper wrote a bare geometry
  // that the read path silently rejected, so every fish area was dropped.
  it('writes a geometry the read path can parse back', () => {
    const area = toFishRegulatoryArea(buildFeature())

    expect(parseGeoJSONFeature(area!.geometry)?.geometry).toEqual(buildFeature().geometry)
  })
})
