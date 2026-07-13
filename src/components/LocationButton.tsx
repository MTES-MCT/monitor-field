import { Spacing } from "@constants/theme";
import { useAppMode } from "@contexts/AppModeContext";
import { useTheme } from "@hooks/use-theme";
import { Image } from "expo-image";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { AppState, Pressable, StyleSheet, View } from "react-native";

type LocationButtonProps = {
  onLocate: (coordinates: { longitude: number; latitude: number }) => void;
};

export function LocationButton({ onLocate }: LocationButtonProps) {
  const [isLocationGrantedAndEnabled, setIsLocationGrantedAndEnabled] =
    useState<boolean>(false);

  const theme = useTheme();
  const { isLocationEnabled, setIsLocationEnabled } = useAppMode();
  const iconTintColor = isLocationEnabled ? theme.blueGray : theme.slateGray;

  useEffect(() => {
    const syncLocationAvailability = async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      const isServicesEnabled = await Location.hasServicesEnabledAsync();
      setIsLocationGrantedAndEnabled(status === "granted" && isServicesEnabled);
    };

    void syncLocationAvailability();

    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        void syncLocationAvailability();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const getLocation = async () => {
    if (isLocationGrantedAndEnabled === false) {
      return;
    }

    if (!isLocationEnabled) {
      try {
        const position =
          (await Location.getLastKnownPositionAsync()) ??
          (await Location.getCurrentPositionAsync({}));

        if (!position) {
          return;
        }

        onLocate({
          longitude: position.coords.longitude,
          latitude: position.coords.latitude,
        });
      } catch (error) {
        console.warn("Unable to retrieve current location", error);
      }
    }
    setIsLocationEnabled(!isLocationEnabled);
  };

  return (
    <>
      <View style={styles.wrapper}>
        <Pressable
          onPress={getLocation}
          accessibilityRole="button"
          accessibilityState={{
            disabled: isLocationGrantedAndEnabled === false,
          }}
          style={() => [styles.buttonBase, { backgroundColor: theme.white }]}
        >
          <Image
            key={`${isLocationGrantedAndEnabled}-${isLocationEnabled}`}
            source={
              isLocationGrantedAndEnabled === false
                ? require("../../assets/icons/location-disabled.svg")
                : require("../../assets/icons/location.svg")
            }
            cachePolicy="none"
            transition={0}
            style={[
              styles.icon,
              {
                tintColor: iconTintColor,
              },
            ]}
          />
        </Pressable>
      </View>
    </>
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
