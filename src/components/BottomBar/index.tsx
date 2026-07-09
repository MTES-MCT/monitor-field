import { Spacing } from "@constants/theme";
import { useAppMode } from "@contexts/AppModeContext";
import { useRegulatoryAreasContext } from "@contexts/RegulatoryAreasContext";
import { useTheme } from "@hooks/use-theme";
import { Image } from "expo-image";
import { Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "../Text";

type BottomBarProps = {
  onSearch: () => Promise<void>;
  consultRegulatoryAreas: () => void;
};

export function BottomBar({
  onSearch,
  consultRegulatoryAreas,
}: BottomBarProps) {
  const { config } = useAppMode();
  const {
    setIsSearchZoneActive,
    isSearchZoneActive,
    searchBbox,
    setCommittedSearchBbox,
    hasSearchZoneChanged,
    setHasSearchZoneChanged,
    totalCount,
  } = useRegulatoryAreasContext();
  const theme = useTheme();

  const searchByZone = async () => {
    setIsSearchZoneActive(!isSearchZoneActive);
    searchByNewZone();
  };

  const searchByNewZone = async () => {
    setCommittedSearchBbox(searchBbox);
    setHasSearchZoneChanged(false);

    await onSearch();
  };

  const searchByQuery = () => {};

  return (
    <View>
      {hasSearchZoneChanged && (
        <Pressable
          onPress={searchByNewZone}
          accessibilityRole="button"
          style={[
            styles.buttonBase,
            {
              backgroundColor: theme.charcoal,
              marginBottom: Spacing.two,
            },
          ]}
        >
          <ThemedText themeColor="white" type="small">
            Chercher dans cette zone
          </ThemedText>
        </Pressable>
      )}
      <View style={styles.wrapper}>
        <View style={styles.displayWrapper}>
          <Pressable
            onPress={searchByZone}
            accessibilityRole="button"
            style={[
              styles.buttonBase,
              {
                backgroundColor: isSearchZoneActive
                  ? theme.blueGray
                  : theme.charcoal,
                flex: !isSearchZoneActive ? 1 : 0,
              },
            ]}
          >
            <Image
              source={require("../../../assets/icons/display.svg")}
              style={[styles.icon, { tintColor: theme.white }]}
            />
            {!isSearchZoneActive && (
              <ThemedText
                type="small"
                themeColor="white"
                style={{ marginLeft: Spacing.two }}
              >
                Afficher les reg.ici
              </ThemedText>
            )}
          </Pressable>
          {isSearchZoneActive && (
            <Pressable
              onPress={consultRegulatoryAreas}
              accessibilityRole="button"
              accessibilityState={{
                selected: isSearchZoneActive,
                disabled: false,
              }}
              style={[
                styles.buttonBase,
                {
                  backgroundColor: theme.white,
                  flex: 1,
                },
              ]}
            >
              <ThemedText type="small" themeColor="text">
                REG ({totalCount ?? 0})
              </ThemedText>
            </Pressable>
          )}
        </View>
        <View style={styles.searchAndFilterWrapper}>
          <Pressable
            onPress={searchByQuery}
            accessibilityRole="button"
            accessibilityState={{
              disabled: false,
            }}
            style={[styles.buttonBase, { backgroundColor: theme.white }]}
          >
            <Image
              source={require("../../../assets/icons/search.svg")}
              style={styles.icon}
            />
          </Pressable>
          {config.features.hasRegulatoryAreasFilters && (
            <Pressable
              onPress={searchByQuery}
              accessibilityRole="button"
              accessibilityState={{
                disabled: false,
              }}
              style={[styles.buttonBase, { backgroundColor: theme.white }]}
            >
              <Image
                source={require("../../../assets/icons/filter.svg")}
                style={styles.icon}
              />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  buttonBase: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.three,
  },
  displayWrapper: {
    flex: 1,
    flexDirection: "row",
    gap: Spacing.half,
  },
  icon: {
    height: Spacing.five,
    width: Spacing.five,
  },
  searchAndFilterWrapper: {
    flexDirection: "row",
    gap: Spacing.half,
  },
});
