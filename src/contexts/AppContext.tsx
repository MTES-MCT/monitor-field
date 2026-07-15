import { AppMode, AppModeConfig } from "@config/appModes";
import { monitorEnvConfig } from "@config/appModes/monitorenv.config";
import { monitorFishConfig } from "@config/appModes/monitorfish.config";
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

const configs: Record<AppMode, AppModeConfig> = {
  MONITORENV: monitorEnvConfig,
  MONITORFISH: monitorFishConfig,
};

export type RegulatoryModalHandlers = {
  presentList?: () => void;
  dismissList?: () => void;
  presentDetails?: () => void;
  dismissDetails?: () => void;
};

const AppContext = createContext<
  | {
      config: AppModeConfig;
      setMode: (mode: AppMode) => void;
      isLocationEnabled: boolean;
      setIsLocationEnabled: (enabled: boolean) => void;
      registerRegulatoryModalHandlers: (
        handlers: RegulatoryModalHandlers,
      ) => () => void;
      openRegulatoryModalFromMapClick: () => void;
      closeRegulatoryModalFromMapClick: () => void;
      openRegulatoryModalFromFilterButtons: () => void;
      closeRegulatoryModalFromFilterButtons: () => void;
    }
  | undefined
>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<AppMode>("MONITORENV");
  const [isLocationEnabled, setIsLocationEnabled] = useState<boolean>(false);
  const modalHandlersRef = useRef<RegulatoryModalHandlers>({});

  const config = configs[mode];

  const registerRegulatoryModalHandlers = useCallback(
    (handlers: RegulatoryModalHandlers) => {
      modalHandlersRef.current = {
        ...modalHandlersRef.current,
        ...handlers,
      };

      return () => {
        const nextHandlers = { ...modalHandlersRef.current };
        (Object.keys(handlers) as (keyof RegulatoryModalHandlers)[]).forEach(
          (key) => {
            nextHandlers[key] = undefined;
          },
        );
        modalHandlersRef.current = nextHandlers;
      };
    },
    [],
  );

  const openRegulatoryModalFromMapClick = useCallback(() => {
    modalHandlersRef.current.presentDetails?.();
  }, []);

  const closeRegulatoryModalFromMapClick = useCallback(() => {
    modalHandlersRef.current.dismissDetails?.();
  }, []);

  const openRegulatoryModalFromFilterButtons = useCallback(() => {
    modalHandlersRef.current.presentList?.();
  }, []);

  const closeRegulatoryModalFromFilterButtons = useCallback(() => {
    modalHandlersRef.current.dismissList?.();
  }, []);

  return (
    <AppContext.Provider
      value={{
        config,
        setMode,
        isLocationEnabled,
        setIsLocationEnabled,
        registerRegulatoryModalHandlers,
        openRegulatoryModalFromMapClick,
        closeRegulatoryModalFromMapClick,
        openRegulatoryModalFromFilterButtons,
        closeRegulatoryModalFromFilterButtons,
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
