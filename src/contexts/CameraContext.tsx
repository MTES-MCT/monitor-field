import type { CameraRef, LngLat, LngLatBounds } from '@maplibre/maplibre-react-native'
import { createContext, useContext, useRef, useState, type RefObject } from 'react'

import type { RegulatoryAreaListItem } from './RegulatoryAreasContext'

export const FIT_BOUNDS_PADDING = { bottom: 540, left: 40, right: 40, top: 40 }

type PreviousZoomAndBbox = { zoom: number | undefined; bbox: LngLatBounds | undefined } | undefined

const CameraContext = createContext<
  | {
      cameraRef: RefObject<CameraRef | null>
      zoomOnRegulatoryArea: (area: RegulatoryAreaListItem | undefined) => void
      clickedCoordinate: LngLat | undefined
      setClickedCoordinate: (coordinate: LngLat | undefined) => void
      currentZoom: number | undefined
      setCurrentZoom: (zoom: number | undefined) => void
      previousZoomAndBbox: PreviousZoomAndBbox
      setPreviousZoomAndBbox: (zoomAndBbox: PreviousZoomAndBbox) => void
    }
  | undefined
>(undefined)

export function CameraProvider({ children }: { children: React.ReactNode }) {
  const cameraRef = useRef<CameraRef>(null)

  const [clickedCoordinate, setClickedCoordinate] = useState<LngLat | undefined>(undefined)
  const [currentZoom, setCurrentZoom] = useState<number | undefined>(undefined)
  const [previousZoomAndBbox, setPreviousZoomAndBbox] = useState<PreviousZoomAndBbox>(undefined)

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
        currentZoom,
        previousZoomAndBbox,
        setClickedCoordinate,
        setCurrentZoom,
        setPreviousZoomAndBbox,
        zoomOnRegulatoryArea
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
