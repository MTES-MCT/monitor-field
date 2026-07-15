import { AppMode } from "@config/appModes";
import { useAppContext } from "@contexts/AppContext";
import { useRegulatoryAreasContext } from "@contexts/RegulatoryAreasContext";
import { useTheme } from "@hooks/use-theme";
import { Image } from "expo-image";
import { Pressable, StyleSheet, View } from "react-native";

function getVisualState(params: {
  mode: AppMode;
  selected: boolean;
  theme: ReturnType<typeof useTheme>;
}) {
  const { mode, selected, theme } = params;

  const activeTint =
    mode === "MONITORFISH" ? theme.blueGray : theme.mediumSeaGreen;

  return {
    container: {
      backgroundColor: selected ? activeTint : theme.gainsboro,
      opacity: 1,
      borderRadius: 0,
    },
    icon: {
      tintColor: selected ? theme.white : theme.slateGray,
      opacity: selected ? 1 : 0.8,
    },
  };
}

export function SwitchContextButton() {
  const { config, setMode } = useAppContext();
  const { setSelectedRegulatoryArea, setIsSearchByQueryActive } =
    useRegulatoryAreasContext();
  const theme = useTheme();

  const switchContext = (mode: AppMode) => {
    setMode(mode);
    setSelectedRegulatoryArea(undefined);
    setIsSearchByQueryActive(false);
  };

  return (
    <View style={styles.wrapper}>
      <Pressable
        onPress={() => switchContext("MONITORENV")}
        accessibilityRole="button"
        accessibilityState={{
          selected: config.mode === "MONITORENV",
          disabled: false,
        }}
        style={() => [
          styles.buttonBase,
          getVisualState({
            mode: "MONITORENV",
            selected: config.mode === "MONITORENV",
            theme,
          }).container,
        ]}
      >
        <Image
          source={require("../../assets/icons/algae.svg")}
          style={[
            styles.icon,
            getVisualState({
              mode: "MONITORENV",
              selected: config.mode === "MONITORENV",
              theme,
            }).icon,
          ]}
        />
      </Pressable>
      <Pressable
        onPress={() => switchContext("MONITORFISH")}
        accessibilityRole="button"
        accessibilityState={{
          selected: config.mode === "MONITORFISH",
          disabled: false,
        }}
        style={() => [
          styles.buttonBase,
          getVisualState({
            mode: "MONITORFISH",
            selected: config.mode === "MONITORFISH",
            theme,
          }).container,
        ]}
      >
        <Image
          source={require("../../assets/icons/fish.svg")}
          style={[
            styles.icon,
            getVisualState({
              mode: "MONITORFISH",
              selected: config.mode === "MONITORFISH",
              theme,
            }).icon,
          ]}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    display: "flex",
    flexDirection: "row",
  },
  buttonBase: {
    alignItems: "center",
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  icon: {
    height: 24,
    width: 24,
  },
});
