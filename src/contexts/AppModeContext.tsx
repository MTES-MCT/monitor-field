import { AppMode, AppModeConfig } from "@config/appModes";
import { monitorEnvConfig } from "@config/appModes/monitorenv.config";
import { monitorFishConfig } from "@config/appModes/monitorfish.config";
import { createContext, useContext, useState } from "react";

const configs: Record<AppMode, AppModeConfig> = {
  MONITORENV: monitorEnvConfig,
  MONITORFISH: monitorFishConfig,
};

const AppModeContext = createContext<
  | {
      config: AppModeConfig;
      setMode: (mode: AppMode) => void;
      isLocationEnabled: boolean;
      setIsLocationEnabled: (enabled: boolean) => void;
    }
  | undefined
>(undefined);

export function AppModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<AppMode>("MONITORENV");
  const [isLocationEnabled, setIsLocationEnabled] = useState<boolean>(false);

  const config = configs[mode];

  return (
    <AppModeContext.Provider
      value={{ config, setMode, isLocationEnabled, setIsLocationEnabled }}
    >
      {children}
    </AppModeContext.Provider>
  );
}

export function useAppMode() {
  const ctx = useContext(AppModeContext);
  if (!ctx) throw new Error("useAppMode must be used within AppModeProvider");
  return ctx;
}
