/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "#B7B7B7";
const tintColorDark = "#B7B7B7";

export const COLORS = {
  linearGradient: {
    start: "#2B2B2B",
    end: "#151414",
  },
  placeholderText: "#9CA3AF",
  bodyText: "#A1A1A1",
  black: "#151414",
  textIcons: "#6B7280",
  error: "#EF4444",
  white: "#FFFFFF",
  primary: "#6646EC", // Steel blue
  secondary: "#B7B7B7", // Light gray
  tertiary: "#FF6B5C", // Coral red
  quaternary: "#1E3C7B", // Navy blue
  quinary: "#8FAD8E", // Sage green
  light: {
    text: "#11181C",
    subtitle: "#444444",
    disabled: "#cccccc",
    background: "#D9D9D9",
    border: "#ffffff",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#ECEDEE",
    background: "#B7B7B7",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
  },
  text: {
    header: "#11181C",
    subheader: "#ECEDEE",
  },
  separatorline: {
    light: "rgba(255,255,255,0.12)",
    dark: "#2B2B2B",
  },
};

export const ACTIVITY_COLORS = [
  "#4A6EA3", // Steel blue
  "#FFEB99", // Light yellow
  "#FF6B5C", // Coral red
  "#1E3C7B", // Navy blue
  "#8FAD8E", // Sage green
  "#6B5CFF", // Purple
  "#A8C7E5", // Light blue
  "#FFB347", // Orange
  "#E57BAE", // Rose pink
  "#CCCCCC", // Gray
  "#7BAE57", // Forest green
  "#9C8AC0", // Muted purple
];
export const backgroundLinearColors = {
  primary: {
    start: "#D9D9D9",
    end: "#D9D9D9",
  },
  secondary: {
    start: "#2B2B2B",
    end: "#151414",
  },
};
