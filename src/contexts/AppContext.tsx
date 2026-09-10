import type { AppMode, AppModeConfig } from '@config/appModes'
import { monitorEnvConfig } from '@config/appModes/monitorenv.config'
import { monitorFishConfig } from '@config/appModes/monitorfish.config'
import { createContext, useContext, useState } from 'react'

const configs: Record<AppMode, AppModeConfig> = {
  MONITORENV: monitorEnvConfig,
  MONITORFISH: monitorFishConfig
}

export type ModalType =
  | 'SEARCH_BY_QUERY_MODAL'
  | 'CLICKED_FEATURES_LIST_MODAL'
  | 'REGULATORY_AREAS_LIST_MODAL'
  | 'REGULATORY_AREA_DETAILS_MODAL'
  | undefined

const AppContext = createContext<
  | {
      config: AppModeConfig
      isLocationButtonEnabled: boolean
      setIsLocationButtonEnabled: (isEnabled: boolean) => void
      setMode: (mode: AppMode) => void
      activeModal: ModalType
      setActiveModal: (modal: ModalType) => void
    }
  | undefined
>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<AppMode>('MONITORENV')
  const [isLocationButtonEnabled, setIsLocationButtonEnabled] = useState<boolean>(true)
  const [activeModal, setActiveModal] = useState<ModalType>(undefined)

  const config = configs[mode]

  return (
    <AppContext.Provider
      value={{
        activeModal,
        config,
        isLocationButtonEnabled,
        setActiveModal,
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
