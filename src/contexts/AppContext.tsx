import { AppMode, AppModeConfig } from "@config/appModes";
import { monitorEnvConfig } from "@config/appModes/monitorenv.config";
import { monitorFishConfig } from "@config/appModes/monitorfish.config";
import { createContext, useContext, useState } from "react";

const configs: Record<AppMode, AppModeConfig> = {
  MONITORENV: monitorEnvConfig,
  MONITORFISH: monitorFishConfig,
};

const AppContext = createContext<
  | {
      config: AppModeConfig;
      setMode: (mode: AppMode) => void;
      isLocationEnabled: boolean;
      setIsLocationEnabled: (enabled: boolean) => void;
    }
  | undefined
>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<AppMode>("MONITORENV");
  const [isLocationEnabled, setIsLocationEnabled] = useState<boolean>(false);

  const config = configs[mode];

  return (
    <AppContext.Provider
      value={{
        config,
        setMode,
        isLocationEnabled,
        setIsLocationEnabled,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
