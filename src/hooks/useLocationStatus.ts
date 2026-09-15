import { useAppContext } from '@contexts/AppContext'
import { logSentryError } from '@utils/sentryLogger'
import * as Location from 'expo-location'
import { useCallback, useEffect, useRef, useState } from 'react'

type LocationStatus = {
  isLocationGranted: boolean
  isLocationEnabled: boolean
}

const POLLING_INTERVAL_MS = 4000

export function useLocationStatus() {
  const [status, setStatus] = useState<LocationStatus>({
    isLocationEnabled: false,
    isLocationGranted: false
  })
  const isMountedRef = useRef(true)
  const { isLocationButtonEnabled, setIsLocationButtonEnabled } = useAppContext()

  const refreshLocationStatus = useCallback(async () => {
    try {
      const { status: permissionStatus } = await Location.getForegroundPermissionsAsync()
      const isLocationGranted = permissionStatus === 'granted'

      if (!isLocationGranted) {
        if (isMountedRef.current) {
          setStatus({ isLocationEnabled: false, isLocationGranted: false })
        }
        return
      }

      const isLocationEnabled = await Location.hasServicesEnabledAsync()

      if (isMountedRef.current) {
        if (isLocationButtonEnabled !== isLocationEnabled) {
          setIsLocationButtonEnabled(isLocationEnabled)
        }
        setStatus(prev => {
          if (prev.isLocationGranted === true && prev.isLocationEnabled === isLocationEnabled) {
            return prev
          }
          return { isLocationEnabled, isLocationGranted: true }
        })
      }
    } catch (error) {
      logSentryError(error, 'Unable to refresh location status')
      if (isMountedRef.current) {
        setStatus(prev => ({ ...prev }))
      }
    }
  }, [isLocationButtonEnabled, setIsLocationButtonEnabled])

  const requestPermissionOnce = useCallback(async () => {
    try {
      await Location.requestForegroundPermissionsAsync()
    } catch (error) {
      logSentryError(error, 'Unable to request location permission')
    } finally {
      await refreshLocationStatus()
    }
  }, [refreshLocationStatus])

  useEffect(() => {
    isMountedRef.current = true
    requestPermissionOnce()

    const interval = setInterval(refreshLocationStatus, POLLING_INTERVAL_MS)

    return () => {
      isMountedRef.current = false
      clearInterval(interval)
    }
  }, [requestPermissionOnce, refreshLocationStatus])

  return { ...status, refreshLocationStatus }
}
