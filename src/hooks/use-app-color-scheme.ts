import { useColorScheme } from "react-native";

export type AppColorScheme = 'light' | 'dark';

export function useAppColorScheme(): AppColorScheme {
  const scheme = useColorScheme();
  return scheme === 'dark' ? 'dark' : 'light';
}