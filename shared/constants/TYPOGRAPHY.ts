/**
 * Centralized Typography System
 *
 * This file defines the complete typography system for the Cadence.day app.
 * All text styling should reference these constants to ensure consistency.
 *
 * Usage:
 * import { TYPOGRAPHY } from '@/shared/constants/TYPOGRAPHY';
 *
 * style: {
 *   ...TYPOGRAPHY.sizes.base,
 *   fontFamily: TYPOGRAPHY.fontFamilies.primary,
 * }
 */

import { COLORS } from "./COLORS";

// Font Family Constants
export const FONT_FAMILIES = {
    // Primary font family - FoundersGrotesk (used for headings, labels, and primary text)
    primary: "FoundersGrotesk-Regular",
    primaryBold: "FoundersGrotesk-Bold",
    primaryMedium: "FoundersGrotesk-Medium",
    primarySemibold: "FoundersGrotesk-Semibold",

    // Secondary font family - Graphik (used for body text and UI elements)
    secondary: "Graphik-Regular",
    secondaryBold: "Graphik-Bold",
    secondaryExtralight: "Graphik-Extralight",
    secondarySemibold: "Graphik-Semibold",

    // Monospace font for code/technical content
    monospace: "SpaceMono-Regular",

    // System fonts for specific cases
    systemMonospace: "monospace",
    courier: "Courier",
} as const;

// Font Size Scale (based on existing usage patterns)
export const FONT_SIZES = {
    // Micro sizes
    micro: 7, // Used in reflection grid cells
    tiny: 8, // Used in energy indicators
    mini: 9, // Used in 12-hour time format

    // Small sizes
    xs: 10, // Used for small text, labels
    sm: 11, // Used for activity labels
    base: 12, // Base small text size

    // Medium sizes
    md: 14, // Standard body text
    lg: 16, // Large body text, inputs

    // Large sizes
    xl: 18, // Section titles, large text
    "2xl": 20, // Page titles, h2 headings
    "3xl": 22, // Selected time picker values
    "4xl": 24, // Main headings, h1
} as const;

// Font Weight Constants
export const FONT_WEIGHTS = {
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
} as const;

// Line Heights (for better readability)
export const LINE_HEIGHTS = {
    tight: 14, // For compact text
    base: 16, // Standard line height
    normal: 20, // For body text
    relaxed: 24, // For larger text
} as const;

// Letter Spacing (for specific text treatments)
export const LETTER_SPACING = {
    tight: -0.5,
    normal: 0,
    wide: 0.3, // Used for upgrade button text
    wider: 0.98, // Used for activity tags
    widest: 1.2, // Used for small uppercase text
} as const;

// Semantic Typography Styles
// These combine font family, size, weight, and other properties for specific use cases
export const TYPOGRAPHY = {
    // Font families for easy access
    fontFamilies: FONT_FAMILIES,

    // Font sizes for easy access
    sizes: FONT_SIZES,

    // Font weights for easy access
    weights: FONT_WEIGHTS,

    // Line heights for easy access
    lineHeights: LINE_HEIGHTS,

    // Letter spacing for easy access
    letterSpacing: LETTER_SPACING,

    // Semantic text styles
    heading: {
        h1: {
            fontFamily: FONT_FAMILIES.primary,
            fontSize: FONT_SIZES["4xl"],
            fontWeight: FONT_WEIGHTS.normal,
            lineHeight: LINE_HEIGHTS.relaxed,
            lineSpacing: LETTER_SPACING.wide,
            color: COLORS.light.text.primary,
        },
        h2: {
            fontFamily: FONT_FAMILIES.primary,
            fontSize: FONT_SIZES["2xl"],
            fontWeight: FONT_WEIGHTS.normal,
            lineHeight: LINE_HEIGHTS.normal,
            color: COLORS.light.text.secondary,
        },
        h3: {
            color: COLORS.light.text.secondary,
            fontFamily: FONT_FAMILIES.secondary,
            fontSize: FONT_SIZES["base"],
            fontWeight: FONT_WEIGHTS.medium,
            lineHeight: LINE_HEIGHTS.normal,
        },
        h4: {
            fontFamily: FONT_FAMILIES.primary,
            fontSize: FONT_SIZES.lg,
            fontWeight: FONT_WEIGHTS.semibold,
            lineHeight: LINE_HEIGHTS.base,
        },
    },

    // Body text styles
    body: {
        large: {
            fontFamily: FONT_FAMILIES.secondary,
            fontSize: FONT_SIZES.lg,
            fontWeight: FONT_WEIGHTS.normal,
            lineHeight: LINE_HEIGHTS.normal,
        },
        medium: {
            fontFamily: FONT_FAMILIES.secondary,
            fontSize: FONT_SIZES.md,
            fontWeight: FONT_WEIGHTS.normal,
            lineHeight: LINE_HEIGHTS.base,
        },
        small: {
            fontFamily: FONT_FAMILIES.secondary,
            fontSize: FONT_SIZES.base,
            fontWeight: FONT_WEIGHTS.normal,
            lineHeight: LINE_HEIGHTS.base,
        },
    },

    // Label and UI text styles
    label: {
        large: {
            fontFamily: FONT_FAMILIES.primary,
            fontSize: FONT_SIZES.md,
            fontWeight: FONT_WEIGHTS.semibold,
            textTransform: "uppercase" as const,
            letterSpacing: LETTER_SPACING.wide,
        },
        medium: {
            fontFamily: FONT_FAMILIES.primary,
            fontSize: FONT_SIZES.base,
            fontWeight: FONT_WEIGHTS.semibold,
            textTransform: "uppercase" as const,
            letterSpacing: LETTER_SPACING.widest,
        },
        small: {
            fontFamily: FONT_FAMILIES.primary,
            fontSize: FONT_SIZES.xs,
            fontWeight: FONT_WEIGHTS.semibold,
            textTransform: "uppercase" as const,
            letterSpacing: LETTER_SPACING.widest,
        },
    },

    // Button text styles
    button: {
        large: {
            fontFamily: FONT_FAMILIES.secondary,
            fontSize: FONT_SIZES.xl,
            fontWeight: FONT_WEIGHTS.semibold,
        },
        medium: {
            fontFamily: FONT_FAMILIES.secondary,
            fontSize: FONT_SIZES.lg,
            fontWeight: FONT_WEIGHTS.semibold,
        },
        small: {
            fontFamily: FONT_FAMILIES.secondary,
            fontSize: FONT_SIZES.md,
            fontWeight: FONT_WEIGHTS.semibold,
        },
    },

    // Interactive text styles
    interactive: {
        link: {
            fontFamily: FONT_FAMILIES.secondary,
            fontSize: FONT_SIZES.md,
            fontWeight: FONT_WEIGHTS.normal,
            textDecorationLine: "underline" as const,
        },
        clickable: {
            fontFamily: FONT_FAMILIES.secondary,
            fontSize: FONT_SIZES.md,
            fontWeight: FONT_WEIGHTS.normal,
            textDecorationLine: "underline" as const,
        },
        focused: {
            textDecorationLine: "underline" as const,
            fontWeight: FONT_WEIGHTS.semibold,
        },
    },

    // Specialized text styles
    specialized: {
        // For timestamps and time displays
        time: {
            regular: {
                fontFamily: FONT_FAMILIES.primaryMedium,
                fontSize: FONT_SIZES.base,
                fontWeight: FONT_WEIGHTS.extrabold,
            },
            compact: {
                fontFamily: FONT_FAMILIES.primaryMedium,
                fontSize: FONT_SIZES.mini,
                fontWeight: FONT_WEIGHTS.extrabold,
            },
        },

        // For activity tags and chips
        tag: {
            fontFamily: FONT_FAMILIES.primary,
            fontSize: FONT_SIZES.micro,
            fontWeight: FONT_WEIGHTS.normal,
            textTransform: "uppercase" as const,
            letterSpacing: LETTER_SPACING.wider,
        },

        // For small metadata and indicators
        metadata: {
            fontFamily: FONT_FAMILIES.secondary,
            fontSize: FONT_SIZES.xs,
            fontWeight: FONT_WEIGHTS.bold,
        },

        // For error and status messages
        status: {
            error: {
                fontFamily: FONT_FAMILIES.secondary,
                fontSize: FONT_SIZES.base,
                fontWeight: FONT_WEIGHTS.normal,
            },
            success: {
                fontFamily: FONT_FAMILIES.secondary,
                fontSize: FONT_SIZES.base,
                fontWeight: FONT_WEIGHTS.medium,
            },
        },

        // For code and technical content
        code: {
            fontFamily: FONT_FAMILIES.monospace,
            fontSize: FONT_SIZES.md,
            fontWeight: FONT_WEIGHTS.normal,
        },

        // For input fields
        input: {
            fontFamily: FONT_FAMILIES.secondary,
            fontSize: FONT_SIZES.lg,
            fontWeight: FONT_WEIGHTS.normal,
        },

        // For placeholder text
        placeholder: {
            fontFamily: FONT_FAMILIES.secondary,
            fontSize: FONT_SIZES.base,
            fontWeight: FONT_WEIGHTS.normal,
        },
    },
} as const;

// Type exports for TypeScript support
export type FontFamily = typeof FONT_FAMILIES[keyof typeof FONT_FAMILIES];
export type FontSize = typeof FONT_SIZES[keyof typeof FONT_SIZES];
export type FontWeight = typeof FONT_WEIGHTS[keyof typeof FONT_WEIGHTS];
export type LineHeight = typeof LINE_HEIGHTS[keyof typeof LINE_HEIGHTS];
export type LetterSpacing = typeof LETTER_SPACING[keyof typeof LETTER_SPACING];

export default TYPOGRAPHY;
