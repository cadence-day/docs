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
 * Get a contrasting color (black or white) based on background luminance
 * Uses WCAG 2.0 formula for relative luminance calculation
 * @param backgroundColor - Hex color string (with or without #)
 * @returns "#FFFFFF" for dark backgrounds, "#000000" for light backgrounds
 */
export const getContrastColor = (backgroundColor: string): string => {
    // Handle null, undefined, or empty string
    if (!backgroundColor) {
        return "#000000";
    }

    // Remove # if present and ensure we have a valid hex color
    let hex = backgroundColor.replace("#", "").trim();

    // Handle 3-character hex codes by expanding them
    if (hex.length === 3) {
        hex = hex
            .split("")
            .map((char) => char + char)
            .join("");
    }

    // Validate hex format
    if (hex.length !== 6 || !/^[0-9A-Fa-f]{6}$/.test(hex)) {
        // Use the global error handler to report invalid color formats
        // Importing directly would create a cycle; gracefully return default.
        try {
            const { GlobalErrorHandler } = require("@/shared/utils/errorHandler");
            GlobalErrorHandler.logWarning(
                `Invalid color format: ${backgroundColor}. Using default contrast.`,
                "colorUtils:getContrastColor",
                { value: backgroundColor }
            );
        } catch {}
        return "#000000";
    }

    // Convert hex to RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Calculate relative luminance using WCAG 2.0 formula
    const [rs, gs, bs] = [r, g, b].map((c) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });

    const luminance = 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;

    // Return white for dark backgrounds, black for light backgrounds
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
};

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
