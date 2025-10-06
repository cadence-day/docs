/**
 * Centralized Container Styling System
 *
 * This file defines the complete container styling system for the Cadence.day app.
 * All layout, spacing, borders, and container styling should reference these constants.
 *
 * Usage:
 * import { CONTAINER } from '@/shared/constants/CONTAINER';
 *
 * style: {
 *   ...CONTAINER.padding.medium,
 *   ...CONTAINER.margin.top.small,
 * }
 */

// Spacing Constants (padding, margin, gaps)
export const SPACING = {
    // Base spacing scale
    none: 0,
    xs: 2,
    sm: 4,
    base: 8,
    md: 12,
    lg: 16,
    xl: 20,
    "2xl": 24,
    "3xl": 32,
    "4xl": 40,
    "5xl": 48,
    "6xl": 64,
} as const;

// Padding utilities
export const PADDING = {
    // All sides padding
    none: { padding: SPACING.none },
    xs: { padding: SPACING.xs },
    sm: { padding: SPACING.sm },
    base: { padding: SPACING.base },
    md: { padding: SPACING.md },
    lg: { padding: SPACING.lg },
    xl: { padding: SPACING.xl },
    "2xl": { padding: SPACING["2xl"] },
    "3xl": { padding: SPACING["3xl"] },
    "4xl": { padding: SPACING["4xl"] },

    // Directional padding
    horizontal: {
        none: { paddingHorizontal: SPACING.none },
        xs: { paddingHorizontal: SPACING.xs },
        sm: { paddingHorizontal: SPACING.sm },
        base: { paddingHorizontal: SPACING.base },
        md: { paddingHorizontal: SPACING.md },
        lg: { paddingHorizontal: SPACING.lg },
        xl: { paddingHorizontal: SPACING.xl },
        "2xl": { paddingHorizontal: SPACING["2xl"] },
        "3xl": { paddingHorizontal: SPACING["3xl"] },
    },
    vertical: {
        none: { paddingVertical: SPACING.none },
        xs: { paddingVertical: SPACING.xs },
        sm: { paddingVertical: SPACING.sm },
        base: { paddingVertical: SPACING.base },
        md: { paddingVertical: SPACING.md },
        lg: { paddingVertical: SPACING.lg },
        xl: { paddingVertical: SPACING.xl },
        "2xl": { paddingVertical: SPACING["2xl"] },
        "3xl": { paddingVertical: SPACING["3xl"] },
        header: { paddingTop: 18 }, // Special padding for headers
    },
    top: {
        none: { paddingTop: SPACING.none },
        xs: { paddingTop: SPACING.xs },
        sm: { paddingTop: SPACING.sm },
        base: { paddingTop: SPACING.base },
        md: { paddingTop: SPACING.md },
        lg: { paddingTop: SPACING.lg },
        xl: { paddingTop: SPACING.xl },
        "2xl": { paddingTop: SPACING["2xl"] },
        "3xl": { paddingTop: SPACING["3xl"] },
    },
    bottom: {
        none: { paddingBottom: SPACING.none },
        xs: { paddingBottom: SPACING.xs },
        sm: { paddingBottom: SPACING.sm },
        base: { paddingBottom: SPACING.base },
        md: { paddingBottom: SPACING.md },
        lg: { paddingBottom: SPACING.lg },
        xl: { paddingBottom: SPACING.xl },
        "2xl": { paddingBottom: SPACING["2xl"] },
        "3xl": { paddingBottom: SPACING["3xl"] },
    },
    left: {
        none: { paddingLeft: SPACING.none },
        xs: { paddingLeft: SPACING.xs },
        sm: { paddingLeft: SPACING.sm },
        base: { paddingLeft: SPACING.base },
        md: { paddingLeft: SPACING.md },
        lg: { paddingLeft: SPACING.lg },
        xl: { paddingLeft: SPACING.xl },
        "2xl": { paddingLeft: SPACING["2xl"] },
        "3xl": { paddingLeft: SPACING["3xl"] },
    },
    right: {
        none: { paddingRight: SPACING.none },
        xs: { paddingRight: SPACING.xs },
        sm: { paddingRight: SPACING.sm },
        base: { paddingRight: SPACING.base },
        md: { paddingRight: SPACING.md },
        lg: { paddingRight: SPACING.lg },
        xl: { paddingRight: SPACING.xl },
        "2xl": { paddingRight: SPACING["2xl"] },
        "3xl": { paddingRight: SPACING["3xl"] },
    },
} as const;

// Margin utilities
export const MARGIN = {
    // All sides margin
    none: { margin: SPACING.none },
    xs: { margin: SPACING.xs },
    sm: { margin: SPACING.sm },
    base: { margin: SPACING.base },
    md: { margin: SPACING.md },
    lg: { margin: SPACING.lg },
    xl: { margin: SPACING.xl },
    "2xl": { margin: SPACING["2xl"] },
    "3xl": { margin: SPACING["3xl"] },
    "4xl": { margin: SPACING["4xl"] },

    // Directional margin
    horizontal: {
        none: { marginHorizontal: SPACING.none },
        xs: { marginHorizontal: SPACING.xs },
        sm: { marginHorizontal: SPACING.sm },
        base: { marginHorizontal: SPACING.base },
        md: { marginHorizontal: SPACING.md },
        lg: { marginHorizontal: SPACING.lg },
        xl: { marginHorizontal: SPACING.xl },
        "2xl": { marginHorizontal: SPACING["2xl"] },
        "3xl": { marginHorizontal: SPACING["3xl"] },
    },
    vertical: {
        none: { marginVertical: SPACING.none },
        xs: { marginVertical: SPACING.xs },
        sm: { marginVertical: SPACING.sm },
        base: { marginVertical: SPACING.base },
        md: { marginVertical: SPACING.md },
        lg: { marginVertical: SPACING.lg },
        xl: { marginVertical: SPACING.xl },
        "2xl": { marginVertical: SPACING["2xl"] },
        "3xl": { marginVertical: SPACING["3xl"] },
    },
    top: {
        none: { marginTop: SPACING.none },
        xs: { marginTop: SPACING.xs },
        sm: { marginTop: SPACING.sm },
        base: { marginTop: SPACING.base },
        md: { marginTop: SPACING.md },
        lg: { marginTop: SPACING.lg },
        xl: { marginTop: SPACING.xl },
        "2xl": { marginTop: SPACING["2xl"] },
        "3xl": { marginTop: SPACING["3xl"] },
    },
    bottom: {
        none: { marginBottom: SPACING.none },
        xs: { marginBottom: SPACING.xs },
        sm: { marginBottom: SPACING.sm },
        base: { marginBottom: SPACING.base },
        md: { marginBottom: SPACING.md },
        lg: { marginBottom: SPACING.lg },
        xl: { marginBottom: SPACING.xl },
        "2xl": { marginBottom: SPACING["2xl"] },
        "3xl": { marginBottom: SPACING["3xl"] },
    },
    left: {
        none: { marginLeft: SPACING.none },
        xs: { marginLeft: SPACING.xs },
        sm: { marginLeft: SPACING.sm },
        base: { marginLeft: SPACING.base },
        md: { marginLeft: SPACING.md },
        lg: { marginLeft: SPACING.lg },
        xl: { marginLeft: SPACING.xl },
        "2xl": { marginLeft: SPACING["2xl"] },
        "3xl": { marginLeft: SPACING["3xl"] },
    },
    right: {
        none: { marginRight: SPACING.none },
        xs: { marginRight: SPACING.xs },
        sm: { marginRight: SPACING.sm },
        base: { marginRight: SPACING.base },
        md: { marginRight: SPACING.md },
        lg: { marginRight: SPACING.lg },
        xl: { marginRight: SPACING.xl },
        "2xl": { marginRight: SPACING["2xl"] },
        "3xl": { marginRight: SPACING["3xl"] },
    },
} as const;

// Gap utilities (for flexbox layouts)
export const GAP = {
    none: { gap: SPACING.none },
    xs: { gap: SPACING.xs },
    sm: { gap: SPACING.sm },
    base: { gap: SPACING.base },
    md: { gap: SPACING.md },
    lg: { gap: SPACING.lg },
    xl: { gap: SPACING.xl },
    "2xl": { gap: SPACING["2xl"] },
    "3xl": { gap: SPACING["3xl"] },
} as const;

// Border radius constants
export const BORDER_RADIUS = {
    none: 0,
    xs: 2,
    sm: 4,
    base: 6,
    md: 8,
    lg: 12,
    xl: 16,
    "2xl": 20,
    "3xl": 24,
    full: 9999, // Perfect circle
} as const;

// Border width constants
export const BORDER_WIDTH = {
    none: 0,
    hairline: 0.5,
    thin: 1,
    base: 2,
    thick: 3,
    heavy: 4,
} as const;

// Border utilities
export const BORDER = {
    radius: {
        none: { borderRadius: BORDER_RADIUS.none },
        xs: { borderRadius: BORDER_RADIUS.xs },
        sm: { borderRadius: BORDER_RADIUS.sm },
        base: { borderRadius: BORDER_RADIUS.base },
        md: { borderRadius: BORDER_RADIUS.md },
        lg: { borderRadius: BORDER_RADIUS.lg },
        xl: { borderRadius: BORDER_RADIUS.xl },
        "2xl": { borderRadius: BORDER_RADIUS["2xl"] },
        "3xl": { borderRadius: BORDER_RADIUS["3xl"] },
        full: { borderRadius: BORDER_RADIUS.full },
    },
    width: {
        none: { borderWidth: BORDER_WIDTH.none },
        hairline: { borderWidth: BORDER_WIDTH.hairline },
        thin: { borderWidth: BORDER_WIDTH.thin },
        base: { borderWidth: BORDER_WIDTH.base },
        thick: { borderWidth: BORDER_WIDTH.thick },
        heavy: { borderWidth: BORDER_WIDTH.heavy },
    },
    top: {
        none: { borderTopWidth: BORDER_WIDTH.none },
        hairline: { borderTopWidth: BORDER_WIDTH.hairline },
        thin: { borderTopWidth: BORDER_WIDTH.thin },
        base: { borderTopWidth: BORDER_WIDTH.base },
        thick: { borderTopWidth: BORDER_WIDTH.thick },
    },
    bottom: {
        none: { borderBottomWidth: BORDER_WIDTH.none },
        hairline: { borderBottomWidth: BORDER_WIDTH.hairline },
        thin: { borderBottomWidth: BORDER_WIDTH.thin },
        base: { borderBottomWidth: BORDER_WIDTH.base },
        thick: { borderBottomWidth: BORDER_WIDTH.thick },
    },
    left: {
        none: { borderLeftWidth: BORDER_WIDTH.none },
        hairline: { borderLeftWidth: BORDER_WIDTH.hairline },
        thin: { borderLeftWidth: BORDER_WIDTH.thin },
        base: { borderLeftWidth: BORDER_WIDTH.base },
        thick: { borderLeftWidth: BORDER_WIDTH.thick },
    },
    right: {
        none: { borderRightWidth: BORDER_WIDTH.none },
        hairline: { borderRightWidth: BORDER_WIDTH.hairline },
        thin: { borderRightWidth: BORDER_WIDTH.thin },
        base: { borderRightWidth: BORDER_WIDTH.base },
        thick: { borderRightWidth: BORDER_WIDTH.thick },
    },
} as const;

// Layout utilities
export const LAYOUT = {
    // Flex utilities
    flex: {
        none: { flex: 0 },
        shrink: { flex: 0, flexShrink: 1 },
        grow: { flex: 1 },
        auto: { flex: 1, flexShrink: 1, flexBasis: "auto" },
    },

    // Flex direction
    direction: {
        row: { flexDirection: "row" as const },
        column: { flexDirection: "column" as const },
        rowReverse: { flexDirection: "row-reverse" as const },
        columnReverse: { flexDirection: "column-reverse" as const },
    },

    // Justify content
    justify: {
        start: { justifyContent: "flex-start" as const },
        center: { justifyContent: "center" as const },
        end: { justifyContent: "flex-end" as const },
        between: { justifyContent: "space-between" as const },
        around: { justifyContent: "space-around" as const },
        evenly: { justifyContent: "space-evenly" as const },
    },

    // Align items
    align: {
        start: { alignItems: "flex-start" as const },
        center: { alignItems: "center" as const },
        end: { alignItems: "flex-end" as const },
        stretch: { alignItems: "stretch" as const },
        baseline: { alignItems: "baseline" as const },
    },

    // Align self
    alignSelf: {
        auto: { alignSelf: "auto" as const },
        start: { alignSelf: "flex-start" as const },
        center: { alignSelf: "center" as const },
        end: { alignSelf: "flex-end" as const },
        stretch: { alignSelf: "stretch" as const },
    },

    // Position utilities
    position: {
        relative: { position: "relative" as const },
        absolute: { position: "absolute" as const },
    },

    // Common positioning
    positioning: {
        absolute: {
            topLeft: { position: "absolute" as const, top: 0, left: 0 },
            topRight: { position: "absolute" as const, top: 0, right: 0 },
            bottomLeft: { position: "absolute" as const, bottom: 0, left: 0 },
            bottomRight: { position: "absolute" as const, bottom: 0, right: 0 },
            center: {
                position: "absolute" as const,
                top: "50%",
                left: "50%",
                transform: [{ translateX: -0.5 }, { translateY: -0.5 }],
            },
            fill: {
                position: "absolute" as const,
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
            },
        },
    },

    // Overflow
    overflow: {
        visible: { overflow: "visible" as const },
        hidden: { overflow: "hidden" as const },
        scroll: { overflow: "scroll" as const },
    },
} as const;

// Size utilities
export const SIZE = {
    // Width utilities
    width: {
        auto: { width: "auto" as const },
        full: { width: "100%" },
        screen: { width: "100%" },
        fit: { width: "auto" as const },
        // Percentage widths
        "1/2": { width: "50%" },
        "1/3": { width: "33.333333%" },
        "2/3": { width: "66.666667%" },
        "1/4": { width: "25%" },
        "3/4": { width: "75%" },
        "1/5": { width: "20%" },
        "2/5": { width: "40%" },
        "3/5": { width: "60%" },
        "4/5": { width: "80%" },
    },

    // Height utilities
    height: {
        auto: { height: "auto" as const },
        full: { height: "100%" },
        screen: { height: "100%" },
        fit: { height: "auto" as const },
    },

    // Min/Max sizes
    minWidth: {
        none: { minWidth: 0 },
        full: { minWidth: "100%" },
    },
    maxWidth: {
        none: { maxWidth: "none" as const },
        full: { maxWidth: "100%" },
    },
    minHeight: {
        none: { minHeight: 0 },
        full: { minHeight: "100%" },
    },
    maxHeight: {
        none: { maxHeight: "none" as const },
        full: { maxHeight: "100%" },
    },
} as const;

// Opacity utilities
export const OPACITY = {
    invisible: { opacity: 0 },
    low: { opacity: 0.1 },
    medium: { opacity: 0.3 },
    high: { opacity: 0.5 },
    visible: { opacity: 0.7 },
    mostVisible: { opacity: 0.9 },
    full: { opacity: 1 },
} as const;

// Combined container utilities
export const CONTAINER = {
    // Basic container patterns
    basic: {
        view: {
            flex: 1,
        },
        centeredView: {
            flex: 1,
            justifyContent: "center" as const,
            alignItems: "center" as const,
        },
        row: {
            flexDirection: "row" as const,
            alignItems: "center" as const,
        },
        column: {
            flexDirection: "column" as const,
        },
        spaceBetween: {
            flexDirection: "row" as const,
            justifyContent: "space-between" as const,
            alignItems: "center" as const,
        },
    },

    // Content containers
    content: {
        screen: {
            flex: 1,
            ...PADDING.lg,
        },
        section: {
            ...MARGIN.bottom.lg,
        },
        card: {
            ...PADDING.md,
            ...BORDER.radius.md,
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            borderWidth: BORDER_WIDTH.thin,
            borderColor: "rgba(255, 255, 255, 0.1)",
        },
    },

    // Form containers
    form: {
        container: {
            ...PADDING.lg,
            ...GAP.md,
        },
        field: {
            ...MARGIN.bottom.md,
        },
        fieldGroup: {
            ...GAP.sm,
        },
    },

    // Button containers
    button: {
        base: {
            ...PADDING.vertical.md,
            ...PADDING.horizontal.lg,
            ...BORDER.radius.base,
            ...LAYOUT.align.center,
            ...LAYOUT.justify.center,
        },
        small: {
            ...PADDING.vertical.sm,
            ...PADDING.horizontal.md,
            ...BORDER.radius.sm,
            ...LAYOUT.align.center,
            ...LAYOUT.justify.center,
        },
        large: {
            ...PADDING.vertical.lg,
            ...PADDING.horizontal.xl,
            ...BORDER.radius.md,
            ...LAYOUT.align.center,
            ...LAYOUT.justify.center,
        },
        icon: {
            ...PADDING.base,
            ...BORDER.radius.full,
            ...LAYOUT.align.center,
            ...LAYOUT.justify.center,
        },
    },

    // List containers
    list: {
        container: {
            ...GAP.sm,
        },
        item: {
            ...PADDING.md,
            ...BORDER.bottom.hairline,
            borderBottomColor: "rgba(255, 255, 255, 0.1)",
        },
        itemLast: {
            ...PADDING.md,
            borderBottomWidth: 0,
        },
    },

    // Modal/Dialog containers
    modal: {
        overlay: {
            ...LAYOUT.positioning.absolute.fill,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            ...LAYOUT.align.center,
            ...LAYOUT.justify.center,
        },
        container: {
            ...SIZE.width["4/5"],
            ...PADDING.xl,
            ...BORDER.radius.lg,
            backgroundColor: "#1a1a1a",
            ...MARGIN.lg,
        },
    },

    // Spacing utilities
    spacing: SPACING,
    padding: PADDING,
    margin: MARGIN,
    gap: GAP,

    // Layout utilities
    layout: LAYOUT,

    // Border utilities
    border: BORDER,

    // Size utilities
    size: SIZE,

    // Opacity utilities
    opacity: OPACITY,
} as const;

// Type exports for TypeScript support
export type SpacingSize = keyof typeof SPACING;
export type BorderRadiusSize = keyof typeof BORDER_RADIUS;
export type BorderWidthSize = keyof typeof BORDER_WIDTH;

export default CONTAINER;
