import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

import { AppModeProvider } from "@/contexts/AppModeContext";
import { useAppColorScheme } from "@/hooks/use-app-color-scheme";
import { getDatabase } from "@/lib/db";
import { syncFishRegulatoryAreas } from "@/lib/fish/fishRegulatoryAreasSync";
import App from ".";

void SplashScreen.preventAutoHideAsync();

const getFishLayers = (async () => {
  try {
    const database = await getDatabase();
    await syncFishRegulatoryAreas(database);
  } catch (error) {
    console.warn("Unable to sync fish regulatory areas", error);
  }
})();

export default function TabLayout() {
  const colorScheme = useAppColorScheme();

  useEffect(() => {
    getFishLayers.finally(() => {
      void SplashScreen.hideAsync();
    });
  }, []);

  return (
    <AppModeProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <App />
      </ThemeProvider>
    </AppModeProvider>
  );
}
