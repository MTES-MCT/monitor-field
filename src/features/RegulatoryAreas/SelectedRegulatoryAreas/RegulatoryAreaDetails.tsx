import { ThemedText } from "@components/Text";
import { Spacing } from "@constants/theme";
import { RegulatoryAreaListItem } from "@contexts/RegulatoryAreasContext";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useTheme } from "@hooks/use-theme";
import { StyleSheet, View } from "react-native";
import { getRegulatoryAreaLabel } from "../utils/getRegulatoryAreaLabel";

type RegulatoryAreasdetailsProps = {
  regulatoryArea: RegulatoryAreaListItem;
  onDismiss: () => void;
};

export const RegulatoryAreaDetails = ({
  regulatoryArea,
}: RegulatoryAreasdetailsProps) => {
  const theme = useTheme();

  const colorKey = regulatoryArea?.fillColor as keyof typeof theme;
  const color = theme[colorKey] ?? theme.white;

  return (
    <BottomSheetScrollView>
      <View style={styles.wrapper}>
        <View
          style={{
            ...styles.square,
            backgroundColor: color,
            borderColor: theme.lightGray,
          }}
        />
        <ThemedText type="default">
          {getRegulatoryAreaLabel(
            regulatoryArea.id,
            regulatoryArea.theme,
            regulatoryArea.type,
          )}
        </ThemedText>
      </View>
      <View style={styles.content}>
        <ThemedText
          type="default"
          style={{ color: theme.textSecondary, marginTop: Spacing.three }}
        >
          Thématique(s)
        </ThemedText>
        <ThemedText type="default">{regulatoryArea.theme}</ThemedText>
        <ThemedText
          type="default"
          style={{ color: theme.textSecondary, marginTop: Spacing.three }}
        >
          Type
        </ThemedText>
        <ThemedText type="default">{regulatoryArea.type}</ThemedText>
        <ThemedText
          type="default"
          style={{ color: theme.textSecondary, marginTop: Spacing.three }}
        >
          Zone
        </ThemedText>
        <ThemedText type="default">{regulatoryArea.zone}</ThemedText>
      </View>
    </BottomSheetScrollView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    flexDirection: "row",
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
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
