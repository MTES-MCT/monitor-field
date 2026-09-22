/**
 * A real `GetFeature` response, with the geometries trimmed: a MultiPolygon, a Polygon, and an
 * unusable feature id. The service sends the JSON columns as strings and never sends `null` —
 * an unset `remarques_generales` comes back as an empty string.
 */
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
        engins:
          '{"otherInfo": null, "authorized": {"allGears": false, "regulatedGears": {}}, "unauthorized": {"allGears": false, "regulatedGearCategories": {"Dragues": {"name": "Dragues"}}, "selectedCategoriesAndGears": ["Dragues"]}}',
        especes:
          '{"otherInfo": null, "authorized": null, "unauthorized": {"species": [{"code": "SCE", "name": "Coquille St-Jacques atlantique"}], "allSpecies": null, "speciesGroups": []}}',
        periodes: '{"dates": [], "always": true, "weekdays": [], "authorized": false, "dateRanges": []}',
        reglementations:
          '[{"url": "https://legipeche.metier.e2.rie.gouv.fr/arrete-prefectoral-r53-2024-03-07-00006-delib-2024-a15811.html", "endDate": "infinite", "textType": ["regulation", "creation"], "reference": "Arrêté Préfectoral R53-2024-03-07-00006 - délib 2024-005 / NAMO", "startDate": "2025-05-22T13:02:13.217Z"}]',
        remarques_generales: '',
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
        engins: '{"otherInfo": null, "authorized": null, "unauthorized": null}',
        especes:
          '{"otherInfo": null, "authorized": {"species": [{"code": "SCE", "name": "Coquille St-Jacques atlantique"}], "allSpecies": null, "speciesGroups": []}, "unauthorized": null}',
        periodes: '{"dates": [], "weekdays": [], "dateRanges": [], "timeIntervals": []}',
        reglementations:
          '[{"url": "https://legipeche.metier.e2.rie.gouv.fr/arrete-r53-2024-06-04-00020-delib-2024-028-namo-a16152.html", "endDate": "infinite", "textType": ["creation", "regulation"], "reference": "Arrêté R53-2024-06-04-00020 / Délib 2024-028 / NAMO", "startDate": "2025-07-15T05:49:00.057Z"}]',
        remarques_generales: '',
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
        engins: '',
        especes: '',
        periodes: '',
        reglementations: '',
        remarques_generales: '',
        thematique: '',
        type_de_reglementation: 'Reg. NAMO',
        zone: 'Zone sans identifiant'
      },
      type: 'Feature'
    }
  ],
  numberMatched: 3,
  numberReturned: 3,
  timeStamp: '2026-09-22T13:51:53.266Z',
  totalFeatures: 3,
  type: 'FeatureCollection'
}
