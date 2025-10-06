/**
 * Color utility functions for theme-aware color selection
 */

import { COLORS } from "@/shared/constants/COLORS";

type ColorScheme = "light" | "dark";

/**
 * Get a theme-aware color value
 * @param colorPath - Path to the color in the COLORS object (e.g., "text.primary")
 * @param scheme - Color scheme ("light" or "dark")
 * @returns Color string
 */
export function getThemedColor(
    colorPath: string,
    scheme: ColorScheme = "light",
): string {
    const pathParts = colorPath.split(".");
    let color: any = COLORS[scheme];

    for (const part of pathParts) {
        if (color && color[part] !== undefined) {
            color = color[part];
        } else {
            // Fallback to light theme if path doesn't exist in dark theme
            if (scheme === "dark") {
                return getThemedColor(colorPath, "light");
            }
            throw new Error(
                `Color path "${colorPath}" not found in ${scheme} theme`,
            );
        }
    }

    return color;
}

/**
 * Create a style object with theme-aware colors
 * @param colorMappings - Object mapping style properties to color paths
 * @param scheme - Color scheme ("light" or "dark")
 * @returns Style object with resolved colors
 */
export function createThemedStyles(
    colorMappings: Record<string, string>,
    scheme: ColorScheme = "light",
): Record<string, string> {
    const styles: Record<string, string> = {};

    for (const [styleProperty, colorPath] of Object.entries(colorMappings)) {
        styles[styleProperty] = getThemedColor(colorPath, scheme);
    }

    return styles;
}

/**
 * Legacy color mapping for backwards compatibility
 * Maps old color references to new themed color paths
 */
export const LEGACY_COLOR_MAPPING: Record<
    string,
    { light: string; dark: string }
> = {
    "#FFFFFF": { light: "neutral.white", dark: "neutral.white" },
    "#000000": { light: "neutral.black", dark: "neutral.black" },
    "#000": { light: "neutral.black", dark: "neutral.black" },
    "#fff": { light: "neutral.white", dark: "neutral.white" },
    "#6646EC": { light: "brand.primary", dark: "brand.primary" },
    "#EF4444": { light: "semantic.error", dark: "semantic.error" },
    "#FF3B30": { light: "semantic.destructive", dark: "semantic.destructive" },
    "#6366F1": { light: "brand.primary", dark: "brand.primary" },
    "#444": { light: "text.secondary", dark: "ui.disabled" },
    "#333": { light: "background.tertiary", dark: "ui.disabled" },
    "#1a1a1a": { light: "background.secondary", dark: "background.secondary" },
    "#2B2B2B": { light: "background.tertiary", dark: "background.tertiary" },
    "rgba(0, 0, 0, 0.5)": {
        light: "background.overlay",
        dark: "background.overlay",
    },
    "rgba(255, 255, 255, 0.1)": {
        light: "interactive.hover",
        dark: "ui.border",
    },
    "rgba(255, 255, 255, 0.05)": {
        light: "interactive.hover",
        dark: "ui.borderSubtle",
    },
};
