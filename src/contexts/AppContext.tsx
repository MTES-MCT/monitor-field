import type { AppMode, AppModeConfig } from '@config/appModes'
import { monitorEnvConfig } from '@config/appModes/monitorenv.config'
import { monitorFishConfig } from '@config/appModes/monitorfish.config'
import { createContext, useContext, useState } from 'react'

const configs: Record<AppMode, AppModeConfig> = {
  MONITORENV: monitorEnvConfig,
  MONITORFISH: monitorFishConfig
}

const AppContext = createContext<
  | {
      config: AppModeConfig
      isLocationButtonEnabled: boolean
      setIsLocationButtonEnabled: (isEnabled: boolean) => void
      setMode: (mode: AppMode) => void
    }
  | undefined
>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<AppMode>('MONITORENV')
  const [isLocationButtonEnabled, setIsLocationButtonEnabled] = useState<boolean>(false)

  const config = configs[mode]

  return (
    <AppContext.Provider
      value={{
        config,
        isLocationButtonEnabled,
        setIsLocationButtonEnabled,
        setMode
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be used within AppProvider')
  return ctx
}
