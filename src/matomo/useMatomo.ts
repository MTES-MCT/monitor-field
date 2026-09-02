import { useContext, useMemo } from 'react'
import { MatomoContext } from './MatomoProvider'

const useMatomo = () => {
  const context = useContext(MatomoContext)
  const instance = context?.instance

  if (!instance) {
    throw new Error('Matomo instance is not available. Make sure to wrap your component tree with <MatomoProvider>.')
  }

  return useMemo(
    () => ({
      removeUserInfo: () => instance.removeUserInfo && instance.removeUserInfo(),
      trackAction: params => instance.trackAction && instance.trackAction(params),
      trackAppStart: params => instance.trackAppStart && instance.trackAppStart(params),
      trackContent: params => instance.trackContent && instance.trackContent(params),
      trackDownload: params => instance.trackDownload && instance.trackDownload(params),
      trackEvent: params => instance.trackEvent && instance.trackEvent(params),
      trackLink: params => instance.trackLink && instance.trackLink(params),
      trackScreenView: params => instance.trackScreenView && instance.trackScreenView(params),
      trackSiteSearch: params => instance.trackSiteSearch && instance.trackSiteSearch(params),
      updateUserInfo: params => instance.updateUserInfo && instance.updateUserInfo(params)
    }),
    [instance]
  )
}

export default useMatomo
