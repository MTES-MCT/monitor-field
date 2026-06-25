import { AppModeConfig } from "./types";

export const monitorFishConfig: AppModeConfig = {
  mode: "MONITORFISH",
  features: {
    hasRegulatoryAreasFilters: false,
  },
  dataLayers: ["fish_regulatory_areas"],
  colors: [
    "yaleBlue",
    "queenBlue",
    "glaucous",
    "blueNcs",
    "iceberg",
    "lightSteelBlue",
    "lightPeriwinkle",
    "aliceBlue",
    "lightBlue",
    "skyBlue",
    "frenchBlue",
    "prussianBlue",
  ],
};
