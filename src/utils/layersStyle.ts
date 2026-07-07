import { useTheme } from "@/hooks/use-theme";

export function normalizeFeatureProperty(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

export function stringToArrayItem(
  str: string,
  arr: string[],
): string | undefined {
  if (arr.length === 0) {
    return undefined;
  }

  let hash = 0;
  if (str.length === 0) {
    return arr[hash];
  }
  for (let i = 0; i < str.length; i += 1) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash &= hash;
  }
  hash = ((hash % arr.length) + arr.length) % arr.length;
  return arr[hash];
}

type ThemeColorKey = keyof ReturnType<typeof useTheme>;

export function resolveThemeColors(
  theme: ReturnType<typeof useTheme>,
  colorKeys: string[] = [],
) {
  return colorKeys.map((colorKey) => theme[colorKey as ThemeColorKey]);
}
