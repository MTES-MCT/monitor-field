export const GEOPF_WFS_URL = 'https://data.geopf.fr/private/wfs/'

export const GEOPF_API_KEY = process.env.EXPO_PUBLIC_CARTES_GOUV_API_KEY

// TODO: republication mints a new typename when the date changes, which breaks every
// shipped app. Move to a stable alias before release.
export const FISH_REGULATORY_AREAS_LAYER =
  'reglementation_des_peches_cartographiee_csv_16-09-2026_wfs:reglementation_des_peches_cartographiee'
