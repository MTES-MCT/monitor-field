import { RegulatoryAreaListItem } from "@contexts/RegulatoryAreasContext";

export function getRegulatoryAreasByGroup(
  regulatoryAreas: RegulatoryAreaListItem[],
): Record<string, RegulatoryAreaListItem[]> {
  const groupedAreas: Record<string, RegulatoryAreaListItem[]> = {};

  for (const area of regulatoryAreas) {
    const groupKey = area.zone || "Zone inconnue";
    if (!groupedAreas[groupKey]) {
      groupedAreas[groupKey] = [];
    }
    groupedAreas[groupKey].push(area);
  }

  return groupedAreas;
}
