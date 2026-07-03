import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";

import { AppModeProvider } from "@/contexts/AppModeContext";
import { RegulatoryAreasProvider } from "@/contexts/RegulatoryAreasContext";
import { useAppColorScheme } from "@/hooks/use-app-color-scheme";
import { getDatabase } from "@/lib/db";
import { syncFishRegulatoryAreas } from "@/lib/fish/fishRegulatoryAreasSync";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import App from ".";

void SplashScreen.preventAutoHideAsync();

const getFishLayers = async () => {
  try {
    const database = await getDatabase();
    await syncFishRegulatoryAreas(database);
    await SplashScreen.hideAsync();
  } catch (error) {
    await SplashScreen.hideAsync();
    console.warn("Unable to sync fish regulatory areas", error);
  }
};

export default function TabLayout() {
  const colorScheme = useAppColorScheme();
  const [isLocationEnabledState, setIsLocationEnabledState] = useState(false);

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
    getFishLayers();
  }, []);

  return (
    <AppModeProvider>
      <RegulatoryAreasProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <App isFirstLocationEnabled={isLocationEnabledState} />
        </ThemeProvider>
      </RegulatoryAreasProvider>
    </AppModeProvider>
  );
}
