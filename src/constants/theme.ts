/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import "@/global.css";

import { Platform } from "react-native";

const lightColors = {
  text: "#282F3E",
  background: "#ffffff",
  backgroundElement: "#F0F0F3",
  backgroundSelected: "#E0E1E6",
  textSecondary: "#60646C",
  gunMetal: "#282F3E",
  // TODO Make that charcoal object 100 & 50
  charcoal: "#3B4559",
  charcoalShadow: "rgba(59, 69, 89, 0.5)",
  slateGray: "#707785",
  lightGray: "#CCCFD6",
  gainsboro: "#E5E5EB",
  cultured: "#F7F7FA",
  white: "#FFFFFF",

  // Accentuation Colors
  blueYonder: "#567A9E",
  blueYonder25: "#D4DDE7",
  blueGray: "#5697D2",
  blueGray25: "#D4E5F4",
  blueGrayBorder: "#AECEEA",
  mayaBlue: "#5FBDFC",
  maximumRed: "#E1000F",
  maximumRed15: "#FBD9DB",
  babyBlueEyes: "#99C9FF",

  // Notification Colors
  mediumSeaGreen: "#29B361",
  mediumSeaGreen25: "#c9ecd7",
  goldenPoppy: "#FAC11A",
  goldenPoppy25: "#FDF3C3",
  goldenPoppyBorder: "#FEE291",

  /** CONTEXTUAL COLORS */

  // Mission status
  yellowGreen: "#8CC800",

  // Risk Factor
  cadetGray: "#8E9A9F",
  grullo: "#B89B8C",
  copperRed: "#CF6A4E",
  chineseRed: "#A13112",

  // Vessel Track
  darkCornflowerBlue: "#2A4670",
  jungleGreen: "#1C9B7B",

  // Beacon Malfunction
  powderBlue: "#9ED7D9",
  wheat: "#EDD6A4",
  opal: "#56B38E",

  earthYellow: "#E6B771",

  // Env Regulatory Areas
  yaleBlue: "#295375",
  queenBlue: "#367096",
  glaucous: "#6284A6",
  blueNcs: "#3690C0",
  iceberg: "#67A9CF",
  lightSteelBlue: "#9AB4D6",
  lightPeriwinkle: "#CDCFEA",
  aliceBlue: "#EBF0F4",
  lightBlue: "#B9DDE5",
  lightCyan: "#C7EAE5",
  middleBlueGreen: "#91CFC9",
  middleBlueGreen2: "#91CFCA",
  verdigris: "#56B3AB",
  verdigris2: "#56B0B3",
  viridianGreen: "#01A29D",
  paoloVeroneseGreen: "#21977F",
  skobeloff: "#016B49",
  blueSapphire: "#016A5E",
  indigoDye: "#033E54",
  skyBlue: "#77C1DE",
  frenchBlue: "#2E75AB",
  prussianBlue: "#003E54",
  lightCoral: "#FA8282",
  brightBlue: "#83E3E7",
  petrol: "#0E737E",
  turquoise: "#0192A2",
  brightTurquoise: "#83E7D3",
  darkPaoloVeroneseGreen: "#0E7E67",
  basicGreen: "#3EB87B",
  sage: "#91CFB0",
  lightGreen: "#C7EAD4",
  brightGreen: "#83E7A9",

  // Vigilance Areas
  rufous: "#A13112",
  brownSugar: "#B0644A",
  rust: "#A85438",
  burntSienna: "#D46E49",
  persianOrange: "#D6814F",
  jasper: "#C25141",
  bittersweet: "#F0755C",
  coral: "#F78A69",
  peach: "#FCB394",
  apricot: "#F0C1A1",
  melon: "#E7A58D",
  paleDogwood: "#F8D7CE",
  seashell: "#FCECE4", // deprecated ?
  champagnePink: "#ECCFC4",

  // AMP Zones
  darkGoldenrod: "#A98A0F",
  ecru: "#BAAB68",
  citron: "#B9B94D",
  citrine: "#C8C732",
  pear: "#DBE33E",
  goldMetallic: "#C5A730",
  oldGold: "#DBB934",
  arylideYellow: "#E1C55E",
  jonquil: "#F0CB38",
  maize: "#F1E243",
  lemonLime: "#F0FE58",
  mindaro: "#F2F58E",
  cream: "#FFFEC2",
} as const;

export const Colors = {
  light: lightColors,
  dark: lightColors,
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

const marianneSans = {
  sans: "Marianne-Regular",
  sansItalic: "Marianne-RegularItalic",
  sansMediumItalic: "Marianne-MediumItalic",
  sansBoldItalic: "Marianne-BoldItalic",
  sansExtraBoldItalic: "Marianne-ExtraBoldItalic",
  sansLight: "Marianne-Light",
  sansLightItalic: "Marianne-LightItalic",
  sansMedium: "Marianne-Medium",
  sansBold: "Marianne-Bold",
  sansExtraBold: "Marianne-ExtraBold",
} as const;

const nativeFallbacks = {
  serif: "serif",
  rounded: "normal",
  mono: "monospace",
} as const;

const webFallbacks = {
  serif: "var(--font-serif)",
  rounded: "var(--font-rounded)",
  mono: "var(--font-mono)",
} as const;

export const Fonts = Platform.select({
  default: {
    ...marianneSans,
    ...nativeFallbacks,
  },
  web: {
    ...marianneSans,
    ...webFallbacks,
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 24,
  six: 32,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
