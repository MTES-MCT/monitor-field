export type AppMode = "MONITORENV" | "MONITORFISH";

export type AppModeConfig = {
  mode: AppMode;
  features: {
    hasRegulatoryAreasFilters: boolean;
  };
  dataLayers: string[];
  colors: string[];
};
