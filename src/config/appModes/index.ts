import { monitorEnvConfig } from "./monitorenv.config";
import { monitorFishConfig } from "./monitorfish.config";
import type { AppMode, AppModeConfig } from "./types";

export const appModeConfigs: Record<AppMode, AppModeConfig> = {
  MONITORENV: monitorEnvConfig,
  MONITORFISH: monitorFishConfig,
};

export type { AppMode, AppModeConfig } from "./types";
