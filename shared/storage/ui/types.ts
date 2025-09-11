/**
 * UI storage types for grid configurations and layout preferences
 */

export interface GridConfiguration {
  columns: number;
  itemHeight: number;
  gridGap: number;
  itemSpacing?: number;
  containerPadding?: number;
  maxWidth?: number;
}

export interface LayoutPreferences {
  compactMode: boolean;
  showLabels: boolean;
  animationsEnabled: boolean;
  dragAndDropEnabled: boolean;
  shakeToEdit: boolean;
}

export interface ThemePreferences {
  colorScheme: "light" | "dark" | "auto";
  accentColor: string;
  fontScale: number;
  highContrast: boolean;
}
