import { useCallback, useContext, useMemo } from 'react'
import { MatomoContext } from './MatomoProvider'
import { useAppContext } from '@contexts/AppContext'

const MODE_DIMENSION = 'Mode'
const ENVIRONMENT_DIMENSION = 'Environment'
const ENV = process.env.EXPO_PUBLIC_SENTRY_ENV

const useMatomo = () => {
  const context = useContext(MatomoContext)
  const { config } = useAppContext()
  const instance = context?.instance

  const withMode = useCallback(
    (params?: { userInfo?: Record<string, string | number | undefined> }) => ({
      ...params,
      userInfo: { ...params?.userInfo, [MODE_DIMENSION]: config.mode, [ENVIRONMENT_DIMENSION]: ENV }
    }),
    [config.mode]
  )

  if (!instance) {
    throw new Error('Matomo instance is not available. Make sure to wrap your component tree with <MatomoProvider>.')
  }

  return useMemo(
    () => ({
      removeUserInfo: () => instance.removeUserInfo && instance.removeUserInfo(),
      trackAction: params => instance.trackAction && instance.trackAction(withMode(params)),
      trackAppStart: params => instance.trackAppStart && instance.trackAppStart(withMode(params)),
      trackContent: params => instance.trackContent && instance.trackContent(withMode(params)),
      trackDownload: params => instance.trackDownload && instance.trackDownload(withMode(params)),
      trackEvent: params => instance.trackEvent && instance.trackEvent(withMode(params)),
      trackLink: params => instance.trackLink && instance.trackLink(withMode(params)),
      trackScreenView: params => instance.trackScreenView && instance.trackScreenView(withMode(params)),
      trackSiteSearch: params => instance.trackSiteSearch && instance.trackSiteSearch(withMode(params)),
      updateUserInfo: params => instance.updateUserInfo && instance.updateUserInfo(withMode(params))
    }),
    [instance, withMode]
  )
}

export default useMatomo
