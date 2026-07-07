import { AppModeConfig } from "./types";

export const monitorEnvConfig: AppModeConfig = {
  mode: "MONITORENV",
  features: {
    hasRegulatoryAreasFilters: true,
  },
  dataLayers: ["env_regulatory_areas"],
  colors: [
    "blueSapphire",
    "skobeloff",
    "basicGreen",
    "opal",
    "sage",
    "lightGreen",
  ],
};
