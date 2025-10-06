/**
 * Theme Hook - Provides current theme colors
 *
 * This hook returns the current theme colors based on the app's theme mode.
 * Currently hardcoded to light theme, but can be extended to support dark theme
 * and dynamic theme switching.
 *
 * Usage:
 * const theme = useTheme();
 * <View style={{ backgroundColor: theme.background.primary }} />
 */

import { COLORS } from "../constants/COLORS";

export type ThemeColors = typeof COLORS.light;

export function useTheme(): ThemeColors {
    // TODO: Add theme mode state management (light/dark)
    // For now, always return light theme
    return COLORS.light;
}

export default useTheme;
