import { useRegulatoryAreasContext } from '@contexts/RegulatoryAreasContext'

export function useFishSearchQuery() {
  const {
    filters: { searchQueryFish }
  } = useRegulatoryAreasContext()

  return searchQueryFish
}
