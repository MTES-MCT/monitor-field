import type { AppMode, AppModeConfig } from '@config/appModes'
import { monitorEnvConfig } from '@config/appModes/monitorenv.config'
import { monitorFishConfig } from '@config/appModes/monitorfish.config'
import { storage } from '@storage'
import { createContext, useContext, useMemo, useRef, useState } from 'react'
import { useMMKVString } from 'react-native-mmkv'

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
      activeModal: ModalType
      setActiveModal: (modal: ModalType) => void
      isRefreshingSettingsData: boolean
      hasAutoLocatedRef: React.RefObject<boolean>
      setIsRefreshingSettingsData: (isRefreshing: boolean) => void
      withOverlay: boolean
      setWithOverlay: (withOverlay: boolean) => void
    }
  | undefined
>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const hasAutoLocatedRef = useRef(false)

  const [withOverlay, setWithOverlay] = useState(false)

  const [activeModal, setActiveModal] = useState<ModalType>(undefined)
  const [isRefreshingSettingsData, setIsRefreshingSettingsData] = useState<boolean>(false)

  const [storedMode] = useMMKVString('mode', storage)

  const mode = useMemo(() => storedMode ?? 'MONITORENV', [storedMode])
  const config = configs[mode]

  // Memoised: without it every state change here re-renders the map screen, which rebuilds
  // the whole map style.
  const value = useMemo(
    () => ({
      activeModal,
      config,
      hasAutoLocatedRef,
      isRefreshingSettingsData,
      setActiveModal,
      setIsRefreshingSettingsData,
      setWithOverlay,
      withOverlay
    }),
    [activeModal, config, isRefreshingSettingsData, withOverlay]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be used within AppProvider')
  return ctx
}
