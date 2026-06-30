import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { Image } from "expo-image";
import { Pressable, StyleSheet, View } from "react-native";

export function LocationButton({
  setIsLocationVisible,
  isLocationVisible,
}: {
  setIsLocationVisible: (visible: boolean) => void;
  isLocationVisible: boolean;
}) {
  const theme = useTheme();

  return (
    <View style={styles.wrapper}>
      <Pressable
        onPress={() => setIsLocationVisible(!isLocationVisible)}
        accessibilityRole="button"
        accessibilityState={{
          selected: isLocationVisible,
          disabled: false,
        }}
        style={() => [styles.buttonBase, { backgroundColor: theme.white }]}
      >
        <Image
          source={require("../../assets/icons/location.svg")}
          style={[
            styles.icon,
            {
              tintColor: isLocationVisible ? theme.blueGray : theme.slateGray,
            },
          ]}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "flex-end",
    paddingTop: Spacing.two,
  },
  buttonBase: {
    alignItems: "center",
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  icon: {
    height: Spacing.five,
    width: Spacing.five,
  },
});
