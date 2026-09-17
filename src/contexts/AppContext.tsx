import type { AppMode, AppModeConfig } from '@config/appModes'
import { monitorEnvConfig } from '@config/appModes/monitorenv.config'
import { monitorFishConfig } from '@config/appModes/monitorfish.config'
import { createContext, useContext, useMemo, useRef, useState } from 'react'

const configs: Record<AppMode, AppModeConfig> = {
  MONITORENV: monitorEnvConfig,
  MONITORFISH: monitorFishConfig
}

export type ModalType =
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
      isRefreshingSettingsData: boolean
      hasAutoLocatedRef: React.RefObject<boolean>
      setIsRefreshingSettingsData: (isRefreshing: boolean) => void
    }
  | undefined
>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const hasAutoLocatedRef = useRef(false)

  const [mode, setMode] = useState<AppMode>('MONITORENV')
  const [isLocationButtonEnabled, setIsLocationButtonEnabled] = useState<boolean>(true)
  const [activeModal, setActiveModal] = useState<ModalType>(undefined)
  const [isRefreshingSettingsData, setIsRefreshingSettingsData] = useState<boolean>(false)

  const config = configs[mode]

  // Memoised: without it every state change here re-renders the map screen, which rebuilds
  // the whole map style.
  const value = useMemo(
    () => ({
      activeModal,
      config,
      hasAutoLocatedRef,
      isLocationButtonEnabled,
      isRefreshingSettingsData,
      setActiveModal,
      setIsLocationButtonEnabled,
      setIsRefreshingSettingsData,
      setMode
    }),
    [activeModal, config, isLocationButtonEnabled, isRefreshingSettingsData]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be used within AppProvider')
  return ctx
}
