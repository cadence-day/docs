/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { COLORS } from "@/shared/constants/COLORS";
import { useColorScheme } from "@/shared/hooks/useColorScheme";
import { Logger } from "../utils";

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName?: keyof typeof COLORS.light & keyof typeof COLORS.dark,
) {
  const theme = useColorScheme() ?? "light";
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else if (colorName) {
    return COLORS[theme][colorName];
  } else {
    // Fallback to primary background if no color specified
    return COLORS[theme].background.primary;
  }
}

/**
 * Enhanced hook for accessing nested color properties
 * @param colorPath - Dot notation path to color (e.g., "text.primary", "background.secondary")
 * @param fallback - Optional fallback color
 */
export function useNestedThemeColor(
  colorPath: string,
  fallback?: string,
): string {
  const theme = useColorScheme() ?? "light";

  try {
    const pathParts = colorPath.split(".");
    let color: unknown = COLORS[theme];

    for (const part of pathParts) {
      if (typeof color === "object" && color !== null && part in color) {
        color = (color as Record<string, unknown>)[part];
      } else {
        throw new Error(`Color path "${colorPath}" not found`);
      }
    }

    if (typeof color === "string") {
      return color;
    } else {
      throw new Error(`Color path "${colorPath}" does not resolve to a string`);
    }
  } catch (error) {
    // Console warn is needed for debugging color issues
    Logger.logWarning(
      `Failed to resolve color path "${colorPath}": ${
        (error as Error).message
      }`,
      "USE_NESTED_THEME_COLOR",
    );
    return fallback || COLORS[theme].text.primary;
  }
}

/**
 * Get brand colors (theme-independent)
 */
export function useBrandColor(colorName: keyof typeof COLORS.brand): string {
  return COLORS.brand[colorName];
}

/**
 * Get semantic colors (theme-independent)
 */
export function useSemanticColor(
  colorName: keyof typeof COLORS.semantic,
): string {
  return COLORS.semantic[colorName];
}
