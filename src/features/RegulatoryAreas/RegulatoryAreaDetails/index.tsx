import { ThemedText } from "@components/Text";
import { Spacing } from "@constants/theme";
import { useRegulatoryAreasContext } from "@contexts/RegulatoryAreasContext";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useTheme } from "@hooks/use-theme";
import { Pressable, StyleSheet, View } from "react-native";
import { getRegulatoryAreaLabel } from "../utils/getRegulatoryAreaLabel";
import { Image } from "expo-image";
import { useEffect, useMemo, useRef } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const RegulatoryAreaDetails = () => {
  const { selectedRegulatoryArea, setSelectedRegulatoryArea } =
    useRegulatoryAreasContext();
  const theme = useTheme();

  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ["25%", "66%", "99%"], []);
  const modalRef = useRef<BottomSheetModal>(null);

  const colorKey = selectedRegulatoryArea?.fillColor as keyof typeof theme;
  const color = theme[colorKey] ?? theme.white;

  const onDismiss = () => {
    setSelectedRegulatoryArea(undefined);
  };

  useEffect(() => {
    if (selectedRegulatoryArea) {
      modalRef.current?.present();
    }
  }, [selectedRegulatoryArea]);

  if (!selectedRegulatoryArea) {
    return null;
  }

  return (
    <BottomSheetModal
      ref={modalRef}
      snapPoints={snapPoints}
      index={1}
      enableDynamicSizing={false}
      enablePanDownToClose
      topInset={insets?.top}
      onDismiss={onDismiss}
    >
      <BottomSheetScrollView>
        <View style={styles.titleWrapper}>
          <View style={styles.title}>
            <View
              style={{
                ...styles.square,
                backgroundColor: color,
                borderColor: theme.lightGray,
              }}
            />
            <ThemedText type="default" style={styles.titleText}>
              {getRegulatoryAreaLabel(
                selectedRegulatoryArea.id,
                selectedRegulatoryArea.theme,
                selectedRegulatoryArea.type,
              )}
            </ThemedText>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              modalRef.current?.dismiss();
              onDismiss();
            }}
          >
            <Image
              source={require("../../../../assets/icons/close.svg")}
              style={styles.icon}
            />
          </Pressable>
        </View>
        <View style={styles.content}>
          <ThemedText
            type="default"
            style={{ color: theme.textSecondary, marginTop: Spacing.three }}
          >
            Thématique(s)
          </ThemedText>
          <ThemedText type="default">{selectedRegulatoryArea.theme}</ThemedText>
          <ThemedText
            type="default"
            style={{ color: theme.textSecondary, marginTop: Spacing.three }}
          >
            Type
          </ThemedText>
          <ThemedText type="default">{selectedRegulatoryArea.type}</ThemedText>
          <ThemedText
            type="default"
            style={{ color: theme.textSecondary, marginTop: Spacing.three }}
          >
            Zone
          </ThemedText>
          <ThemedText type="default">{selectedRegulatoryArea.zone}</ThemedText>
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  titleText: {
    flexShrink: 1,
  },
  titleWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.four,
  },
  title: {
    alignItems: "center",
    flexDirection: "row",
    gap: Spacing.two,
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
  icon: {
    height: Spacing.five,
    width: Spacing.five,
  },
});
