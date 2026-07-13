import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AppModeProvider } from "@contexts/AppModeContext";
import { RegulatoryAreasProvider } from "@contexts/RegulatoryAreasContext";
import { syncFishRegulatoryAreasDB } from "@features/RegulatoryAreas/useCases/syncFishRegulatoryAreasDB";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useAppColorScheme } from "@hooks/use-app-color-scheme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { Appearance } from "react-native";
import App from ".";

void SplashScreen.preventAutoHideAsync();

const getFishLayers = async () => {
  try {
    await syncFishRegulatoryAreasDB();
  } catch (error) {
    console.warn("Unable to sync fish regulatory areas", error);
  }
};

export default function TabLayout() {
  const colorScheme = useAppColorScheme();
  const [isLocationEnabledState, setIsLocationEnabledState] = useState(false);
  useEffect(() => {
    Appearance.setColorScheme("light");
  }, []);

  useEffect(() => {
    async function getCurrentLocation() {
      // request permissions for use location
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        await AsyncStorage.setItem("is-location-granted", "false");
        await AsyncStorage.setItem("is-location-activated", "false");
        return;
      }
      await AsyncStorage.setItem("is-location-granted", "true");

      // check if location is activated on the device
      const isEnabled = await Location.hasServicesEnabledAsync();

      setIsLocationEnabledState(isEnabled);
      await AsyncStorage.setItem(
        "is-location-activated",
        isEnabled ? "true" : "false",
      );
    }

    getCurrentLocation();
  }, []);

  useEffect(() => {
    getFishLayers().finally(() => {
      void SplashScreen.hideAsync();
    });
  }, []);

  return (
    <GestureHandlerRootView>
      <AppModeProvider>
        <RegulatoryAreasProvider>
          <BottomSheetModalProvider>
            <ThemeProvider
              value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
            >
              <App isFirstLocationEnabled={isLocationEnabledState} />
            </ThemeProvider>
          </BottomSheetModalProvider>
        </RegulatoryAreasProvider>
      </AppModeProvider>
    </GestureHandlerRootView>
  );
}
