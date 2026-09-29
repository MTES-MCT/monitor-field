import useMatomo from '@matomo/useMatomo'
import { logToSentry } from '@utils/sentryLogger'
import * as Linking from 'expo-linking'
import { useCallback } from 'react'

export type TrackingEvent = {
  action: string
  category: string
  name: string
}

export function useOpenExternalLink(trackingEvent: TrackingEvent, origin: string) {
  const { trackEvent } = useMatomo()

  return useCallback(
    async (url: string) => {
      if (!(await Linking.canOpenURL(url))) {
        logToSentry(`Don't know how to open this URL: ${url}`, 'info', { extra: { label: origin } })

        return
      }

      await Linking.openURL(url)
      trackEvent(trackingEvent)
    },
    [origin, trackEvent, trackingEvent]
  )
}
