import { BoundingBox } from "@/types/MapTypes";
import { ThemedText } from "@components/Text";
import { Spacing } from "@constants/theme";
import {
  type RegulatoryAreaListItem,
  useRegulatoryAreasContext,
} from "@contexts/RegulatoryAreasContext";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { useTheme } from "@hooks/use-theme";
import { useMemo, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { getRegulatoryAreaLabel } from "../utils/getRegulatoryAreaLabel";
import { getRegulatoryAreasByGroup } from "./utils";

type RegulatoryAreasListProps = {
  areas?: RegulatoryAreaListItem[];
  onDismiss?: () => void;
  onGroupFocus?: (bbox: BoundingBox) => void;
  title?: string;
};

type GroupRow = {
  type: "group";
  group: string;
  areas: RegulatoryAreaListItem[];
};

type AreaRow = {
  type: "area";
  group: string;
  area: RegulatoryAreaListItem;
};

type RegulatoryRow = GroupRow | AreaRow;

function getGroupBoundingBox(
  areas: RegulatoryAreaListItem[],
): BoundingBox | undefined {
  if (areas.length === 0) {
    return undefined;
  }

  return areas.reduce<BoundingBox>(
    (bbox, area) => ({
      minLon: Math.min(bbox.minLon, area.bbox.minLon),
      minLat: Math.min(bbox.minLat, area.bbox.minLat),
      maxLon: Math.max(bbox.maxLon, area.bbox.maxLon),
      maxLat: Math.max(bbox.maxLat, area.bbox.maxLat),
    }),
    { ...areas[0].bbox },
  );
}

export const RegulatoryAreasList = ({
  title,
  areas,
  onGroupFocus,
}: RegulatoryAreasListProps) => {
  const {
    regulatoryAreas,
    setRegulatoryAreas,
    setSelectedRegulatoryArea,
    openRegulatoryDetails,
    closeRegulatoryList,
  } = useRegulatoryAreasContext();
  const theme = useTheme();
  const sourceRegulatoryAreas = areas ?? regulatoryAreas;
  const groupedRegulatoryAreas = useMemo(
    () => Object.entries(getRegulatoryAreasByGroup(sourceRegulatoryAreas)),
    [sourceRegulatoryAreas],
  );
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {},
  );

  const selectRegulatoryArea = (area: RegulatoryAreaListItem) => {
    const hasArea = regulatoryAreas.some(
      (currentArea) => currentArea.id === area.id,
    );
    if (!hasArea) {
      return;
    }

    const updatedAreas = regulatoryAreas.map((currentArea) => ({
      ...currentArea,
      isSelected: currentArea.id === area.id,
    }));

    setSelectedRegulatoryArea(area);
    setRegulatoryAreas(updatedAreas);

    if (!areas) {
      closeRegulatoryList();
    }
    requestAnimationFrame(() => {
      openRegulatoryDetails();
    });
  };

  const clickOnGroup = (group: string, areas: RegulatoryAreaListItem[]) => {
    const nextIsExpanded = !expandedGroups[group];
    setExpandedGroups((currentGroups) => ({
      ...currentGroups,
      [group]: nextIsExpanded,
    }));

    if (nextIsExpanded && onGroupFocus) {
      const groupBoundingBox = getGroupBoundingBox(areas);
      if (groupBoundingBox) {
        onGroupFocus(groupBoundingBox);
      }
    }
  };

  const flattenedRows = useMemo<RegulatoryRow[]>(() => {
    return groupedRegulatoryAreas.flatMap(([group, areas]) => {
      const rows: RegulatoryRow[] = [{ type: "group", group, areas }];

      if (expandedGroups[group]) {
        rows.push(
          ...areas.map((area) => ({
            type: "area" as const,
            group,
            area,
          })),
        );
      }

      return rows;
    });
  }, [expandedGroups, groupedRegulatoryAreas]);

  const renderRow = ({ item }: { item: RegulatoryRow }) => {
    if (item.type === "group") {
      return (
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.groupButton}
          onPress={() => clickOnGroup(item.group, item.areas)}
        >
          <ThemedText type="defaultBold">{item.group}</ThemedText>
        </TouchableOpacity>
      );
    }

    const colorKey = item.area.fillColor as keyof typeof theme;
    const color = theme[colorKey] ?? theme.white;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => selectRegulatoryArea(item.area)}
        style={styles.areaRow}
      >
        <View
          style={{
            ...styles.square,
            backgroundColor: color,
            borderColor: theme.lightGray,
          }}
        />
        <ThemedText type="default">
          {getRegulatoryAreaLabel(
            item.area.id,
            item.area.theme,
            item.area.type,
          )}
        </ThemedText>
      </TouchableOpacity>
    );
  };
  return (
    <BottomSheetFlatList
      style={{ marginBottom: Spacing.six }}
      data={flattenedRows}
      extraData={expandedGroups}
      keyExtractor={(item) =>
        item.type === "group"
          ? `group-${item.group}`
          : `area-${item.group}-${item.area.id}`
      }
      renderItem={renderRow}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={
        <View style={styles.headerRow}>
          <ThemedText type="defaultBold">
            {title ?? `REG (${sourceRegulatoryAreas.length ?? 0}) sur la zone`}
          </ThemedText>
        </View>
      }
      ListEmptyComponent={
        <ThemedText
          type="small"
          themeColor="textSecondary"
          style={styles.emptyState}
        >
          Aucune zone réglementaire dans cette zone de recherche.
        </ThemedText>
      }
      ItemSeparatorComponent={() => (
        <View
          style={{
            height: 1,
            backgroundColor: theme.lightGray,
          }}
        />
      )}
    />
  );
};

const styles = StyleSheet.create({
  headerRow: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.two,
  },
  emptyState: {
    paddingHorizontal: Spacing.four,
  },
  listContent: {
    paddingBottom: Spacing.four,
  },
  groupButton: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  areaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  square: {
    borderWidth: 1,
    height: 20,
    width: 20,
  },
});
