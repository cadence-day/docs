/**
 * Comprehensive color system for the Cadence.day app
 * Organized by function with proper light/dark mode support
 *
 * Usage:
 * - For themed colors: Use useThemeColor() hook or COLORS.light/dark directly
 * - For brand colors: Use COLORS.brand.*
 * - For semantic colors: Use COLORS.semantic.*
 * - For UI elements: Use COLORS.ui.*
 */

export const COLORS = {
  // Brand Colors - Primary app identity colors
  brand: {
    primary: "#6646EC", // Steel blue - main brand color
    secondary: "#B7B7B7", // Light gray - secondary brand color
    tertiary: "#FF6B5C", // Coral red - accent color
    quaternary: "#1E3C7B", // Navy blue - alternative brand color
    quinary: "#8FAD8E", // Sage green - nature/calm accent
  },

  // Semantic Colors - Meaning-based colors (consistent across themes)
  semantic: {
    error: "#EF4444", // Red for errors, warnings
    success: "#00B894", // Green for success states
    warning: "#FFB347", // Orange for warnings
    info: "#3498DB", // Blue for information
    destructive: "#FF3B30", // Red for destructive actions
  },

  // Neutral Colors - Pure colors used across themes
  neutral: {
    black: "#000000",
    darkGray: "#151414",
    mediumGray: "#444444",
    lightGray: "#B7B7B7",
    veryLightGray: "#CCCCCC",
    white: "#FFFFFF",
  },

  // Light Theme Colors
  light: {
    // Backgrounds
    background: {
      primary: "#F7F7F6", // Main background
      secondary: "#FFFFFF", // Cards, modals
      tertiary: "#F5F5F5", // Sections, dividers
      overlay: "rgba(0, 0, 0, 0.5)", // Modal overlays
    },

    // Text Colors
    text: {
      primary: "#11181C", // Main text
      secondary: "#444444", // Subtitles, secondary text
      tertiary: "#6B7280", // Placeholder text, disabled
      inverse: "#FFFFFF", // Text on dark backgrounds
      link: "#6646EC", // Links
    },

    // UI Elements
    ui: {
      border: "#E5E7EB", // Borders, dividers
      borderSubtle: "rgba(0, 0, 0, 0.1)", // Subtle borders
      icon: "#687076", // Default icons
      iconActive: "#6646EC", // Active/selected icons
      tint: "#B7B7B7", // Tab bar tint
      disabled: "#CCCCCC", // Disabled states
      shadow: "#000000", // Shadow color
    },

    // Interactive States
    interactive: {
      hover: "rgba(102, 70, 236, 0.1)", // Hover states
      pressed: "rgba(102, 70, 236, 0.2)", // Pressed states
      focus: "rgba(102, 70, 236, 0.3)", // Focus states
    },
  },

  // Dark Theme Colors
  dark: {
    // Backgrounds
    background: {
      primary: "#151414", // Main background
      secondary: "#1a1a1a", // Cards, modals
      tertiary: "#2B2B2B", // Sections, dividers
      overlay: "rgba(0, 0, 0, 0.7)", // Modal overlays
    },

    // Text Colors
    text: {
      primary: "#ECEDEE", // Main text
      secondary: "#AAAAAA", // Subtitles, secondary text
      tertiary: "#888888", // Placeholder text, disabled
      inverse: "#11181C", // Text on light backgrounds
      link: "#8B5CF6", // Links (lighter variant)
    },

    // UI Elements
    ui: {
      border: "rgba(255, 255, 255, 0.1)", // Borders, dividers
      borderSubtle: "rgba(255, 255, 255, 0.05)", // Subtle borders
      icon: "#9BA1A6", // Default icons
      iconActive: "#8B5CF6", // Active/selected icons
      tint: "#B7B7B7", // Tab bar tint
      disabled: "#444444", // Disabled states
      shadow: "#000000", // Shadow color
    },

    // Interactive States
    interactive: {
      hover: "rgba(255, 255, 255, 0.1)", // Hover states
      pressed: "rgba(255, 255, 255, 0.2)", // Pressed states
      focus: "rgba(139, 92, 246, 0.3)", // Focus states
    },
  },

  // Legacy support - will be deprecated
  // @deprecated Use COLORS.light or COLORS.dark instead
  background: "#F7F7F6",
  linearGradient: {
    start: "#2B2B2B",
    end: "#151414",
  },
  h1: "#363636",
  placeholderText: "#9CA3AF",
  bodyText: "#A1A1A1",
  black: "#151414",
  textIcons: "#6B7280",
  error: "#EF4444",
  white: "#FFFFFF",
  primary: "#6646EC",
  secondary: "#B7B7B7",
  tertiary: "#FF6B5C",
  quaternary: "#1E3C7B",
  quinary: "#8FAD8E",
  text: {
    header: "#11181C",
    subheader: "#ECEDEE",
  },
  separatorline: {
    light: "rgba(255,255,255,0.12)",
    dark: "#2B2B2B",
  },
};

// Activity Colors - Predefined colors for activity categorization
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

// Gradient Colors - For backgrounds and special effects
export const GRADIENTS = {
  // Primary gradients
  primary: {
    start: "#2B2B2B",
    end: "#151414",
  },

  // Background gradients (theme-aware)
  background: {
    light: {
      start: "#F7F7F6",
      end: "#F7F7F6",
    },
    dark: {
      start: "#151414",
      end: "#2B2B2B",
    },
  },

  // Brand gradients
  brand: {
    primary: {
      start: "#6646EC",
      end: "#8B5CF6",
    },
    accent: {
      start: "#FF6B5C",
      end: "#FF8A80",
    },
  },

  // Legacy support
  // @deprecated Use GRADIENTS.background.light/dark instead
  linearGradient: {
    start: "#2B2B2B",
    end: "#151414",
  },
  backgroundLinearColors: {
    primary: {
      start: "#F7F7F6",
      end: "#F7F7F6",
    },
    secondary: {
      start: "#F7F7F6",
      end: "#F7F7F6",
    },
  },
};
