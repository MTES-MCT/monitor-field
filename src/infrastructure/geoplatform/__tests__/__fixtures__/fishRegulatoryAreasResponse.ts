/** A real `GetFeature` response: a MultiPolygon, a Polygon, and an unusable feature id. */
export const FISH_REGULATORY_AREAS_RESPONSE = {
  crs: { properties: { name: 'urn:ogc:def:crs:EPSG::4326' }, type: 'name' },
  features: [
    {
      geometry: {
        coordinates: [
          [
            [
              [-3.43414, 48.83543],
              [-3.41475, 48.83543],
              [-3.41475, 48.83016],
              [-3.43414, 48.83543]
            ]
          ]
        ],
        type: 'MultiPolygon'
      },
      id: 'reglementation_des_peches_cartographiee.1',
      properties: {
        reglementations: 'Arrêté Préfectoral R53-2024-03-07-00006',
        thematique: "Côtes d'Armor - CSJ",
        type_de_reglementation: 'Reg. NAMO',
        zone: 'Banc de Maërl - Zone interdite à la pêche'
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [
          [
            [-2.0042, 48.5705],
            [-2.0015, 48.5721],
            [-1.9997, 48.5726],
            [-2.0042, 48.5705]
          ]
        ],
        type: 'Polygon'
      },
      id: 'reglementation_des_peches_cartographiee.2',
      properties: {
        reglementations: 'Arrêté R53-2024-06-04-00020',
        thematique: 'Côtes d’Armor - CSJ - Plongée',
        type_de_reglementation: 'Reg. NAMO',
        zone: 'Gisement Rance Côte d’Armor'
      },
      type: 'Feature'
    },
    {
      geometry: null,
      id: 'reglementation_des_peches_cartographiee.no-id',
      properties: {
        reglementations: '',
        thematique: '',
        type_de_reglementation: 'Reg. NAMO',
        zone: 'Zone sans identifiant'
      },
      type: 'Feature'
    }
  ],
  numberMatched: 3,
  numberReturned: 3,
  timeStamp: '2026-09-16T13:51:53.266Z',
  totalFeatures: 3,
  type: 'FeatureCollection'
}
