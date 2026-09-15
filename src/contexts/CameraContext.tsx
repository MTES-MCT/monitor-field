import type { CameraRef, LngLat } from '@maplibre/maplibre-react-native'
import { createContext, useContext, useRef, useState, type RefObject } from 'react'

import type { RegulatoryAreaListItem } from './RegulatoryAreasContext'

const FIT_BOUNDS_PADDING = { bottom: 540, left: 40, right: 40, top: 40 }

const CameraContext = createContext<
  | {
      cameraRef: RefObject<CameraRef | null>
      zoomOnRegulatoryArea: (area: RegulatoryAreaListItem | undefined) => void
      zoomToBbox: (centerLat: number, centerLon: number, zoom: number | undefined) => void
      clickedCoordinate: LngLat | undefined
      setClickedCoordinate: (coordinate: LngLat | undefined) => void
      isFromFlyToBbox: boolean
      setIsFromFlyToBbox: (isFromFlyToBbox: boolean) => void
    }
  | undefined
>(undefined)

export function CameraProvider({ children }: { children: React.ReactNode }) {
  const cameraRef = useRef<CameraRef>(null)

  const [clickedCoordinate, setClickedCoordinate] = useState<LngLat | undefined>(undefined)
  const [isFromFlyToBbox, setIsFromFlyToBbox] = useState(false)

  const zoomToBbox = (centerLat: number, centerLon: number, zoom: number | undefined) => {
    cameraRef.current?.flyTo({
      center: [centerLon, centerLat],
      duration: 900,
      easing: 'ease',
      ...(zoom !== undefined && { zoom })
    })
    setIsFromFlyToBbox(true)
  }

  const zoomOnRegulatoryArea = (area: RegulatoryAreaListItem | undefined) => {
    const bbox = area?.bbox
    if (!bbox) {
      return
    }

    cameraRef.current?.fitBounds([bbox.minLon, bbox.minLat, bbox.maxLon, bbox.maxLat], {
      duration: 700,
      easing: 'ease',
      padding: FIT_BOUNDS_PADDING
    })
  }

  return (
    <CameraContext.Provider
      value={{
        cameraRef,
        clickedCoordinate,
        isFromFlyToBbox,
        setClickedCoordinate,
        setIsFromFlyToBbox,
        zoomOnRegulatoryArea,
        zoomToBbox
      }}
    >
      {children}
    </CameraContext.Provider>
  )
}

export function useCameraContext() {
  const ctx = useContext(CameraContext)
  if (!ctx) throw new Error('useCameraContext must be used within CameraProvider')
  return ctx
}
