import {
    withDebugBorder,
    withDebugBorderDashed,
    withDebugBorderThick,
} from "@/shared/constants/isDev";
import { StyleSheet } from "react-native";
import { COLORS } from "../constants/COLORS";
import { CONTAINER } from "../constants/CONTAINER";
import { TYPOGRAPHY } from "../constants/TYPOGRAPHY";

export const generalStyles = StyleSheet.create({
    // LAYOUT CONTAINERS
    container: withDebugBorder({
        ...CONTAINER.basic.centeredView,
    }),

    // Common container patterns
    flexContainer: withDebugBorderDashed({
        ...CONTAINER.basic.view,
        backgroundColor: COLORS.light.background.primary,
    }),
    centeredContainer: withDebugBorder({
        ...CONTAINER.basic.centeredView,
    }),
    flexContainerWithMargins: withDebugBorderThick({
        ...CONTAINER.basic.view,
        ...CONTAINER.margin.horizontal.base,
    }),
    rowContainer: withDebugBorder({
        ...CONTAINER.basic.row,
    }),
    columnContainer: withDebugBorder({
        ...CONTAINER.basic.column,
    }),
    spaceBetweenContainer: withDebugBorder({
        ...CONTAINER.basic.spaceBetween,
    }),

    // Content containers
    screenContainer: withDebugBorder({
        ...CONTAINER.content.screen,
    }),
    sectionContainer: withDebugBorder({
        ...CONTAINER.content.section,
    }),
    cardContainer: {
        ...CONTAINER.content.card,
    },

    // Form containers
    formContainer: {
        ...CONTAINER.form.container,
    },
    fieldContainer: {
        ...CONTAINER.form.field,
    },

    // Button containers
    buttonContainer: {
        ...CONTAINER.button.base,
    },
    smallButtonContainer: {
        ...CONTAINER.button.small,
    },
    largeButtonContainer: {
        ...CONTAINER.button.large,
    },
    iconButtonContainer: {
        ...CONTAINER.button.icon,
    },

    // HEADING STYLES
    h1: {
        ...TYPOGRAPHY.heading.h1,
    },
    h2: {
        ...TYPOGRAPHY.heading.h2,
    },
    h3: {
        ...TYPOGRAPHY.heading.h3,
    },
    h4: {
        ...TYPOGRAPHY.heading.h4,
    },

    // BODY TEXT STYLES
    bodyLarge: {
        ...TYPOGRAPHY.body.large,
        color: COLORS.light.text.primary,
    },
    bodyMedium: {
        ...TYPOGRAPHY.body.medium,
        color: COLORS.light.text.primary,
    },
    bodySmall: {
        ...TYPOGRAPHY.body.small,
        color: COLORS.light.text.secondary,
    },

    // LEGACY STYLES (maintained for compatibility)
    clickableText: {
        ...TYPOGRAPHY.interactive.clickable,
        color: COLORS.light.text.secondary,
    },
    textButton: {
        ...TYPOGRAPHY.interactive.clickable,
        color: COLORS.light.text.primary,
    },
    subtitle: {
        ...TYPOGRAPHY.body.medium,
        color: COLORS.light.text.secondary,
    },
    smallText: {
        ...TYPOGRAPHY.label.small,
        color: COLORS.light.text.tertiary,
        textAlign: "center",
    },
    focusedText: {
        ...TYPOGRAPHY.interactive.focused,
        color: COLORS.light.text.primary,
    },

    // LABEL STYLES
    labelLarge: {
        ...TYPOGRAPHY.label.large,
        color: COLORS.light.text.primary,
    },
    labelMedium: {
        ...TYPOGRAPHY.label.medium,
        color: COLORS.light.text.secondary,
    },
    labelSmall: {
        ...TYPOGRAPHY.label.small,
        color: COLORS.light.text.tertiary,
    },

    // BUTTON TEXT STYLES
    buttonTextLarge: {
        ...TYPOGRAPHY.button.large,
    },
    buttonTextMedium: {
        ...TYPOGRAPHY.button.medium,
    },
    buttonTextSmall: {
        ...TYPOGRAPHY.button.small,
    },

    // INTERACTIVE TEXT STYLES
    linkText: {
        ...TYPOGRAPHY.interactive.link,
        color: COLORS.light.text.link,
    },
    clickableTextPrimary: {
        ...TYPOGRAPHY.interactive.clickable,
        color: COLORS.brand.primary,
    },
    clickableTextSecondary: {
        ...TYPOGRAPHY.interactive.clickable,
        color: COLORS.brand.secondary,
    },

    // STATUS TEXT STYLES
    errorText: {
        ...TYPOGRAPHY.specialized.status.error,
        color: COLORS.semantic.error,
    },
    successText: {
        ...TYPOGRAPHY.specialized.status.success,
        color: COLORS.semantic.success,
    },
    warningText: {
        ...TYPOGRAPHY.specialized.status.error,
        color: COLORS.semantic.warning,
    },

    // SPECIALIZED TEXT STYLES
    timeText: {
        ...TYPOGRAPHY.specialized.time.regular,
        color: COLORS.light.text.primary,
    },
    timeTextCompact: {
        ...TYPOGRAPHY.specialized.time.compact,
        color: COLORS.light.text.secondary,
    },
    tagText: {
        ...TYPOGRAPHY.specialized.tag,
        color: COLORS.neutral.white,
    },
    metadataText: {
        ...TYPOGRAPHY.specialized.metadata,
        color: COLORS.light.text.tertiary,
    },
    codeText: {
        ...TYPOGRAPHY.specialized.code,
        color: COLORS.light.text.primary,
    },
    inputText: {
        ...TYPOGRAPHY.specialized.input,
        color: COLORS.light.text.primary,
    },
    placeholderText: {
        ...TYPOGRAPHY.specialized.placeholder,
        color: COLORS.light.text.tertiary,
    },

    // STATE-BASED TEXT STYLES
    disabledText: {
        color: COLORS.light.ui.disabled,
    },
    selectedText: {
        fontWeight: TYPOGRAPHY.weights.semibold,
        color: COLORS.light.text.primary,
    },
    highlightedText: {
        backgroundColor: COLORS.light.interactive.hover,
        borderRadius: 4,
        paddingHorizontal: 2,
    },

    // UTILITY BUTTON STYLES (non-text)
    outlineDiscreetButton: {
        borderColor: COLORS.light.ui.borderSubtle,
    },
    discreetText: {
        color: COLORS.light.text.tertiary,
    },

    // TEXT ALIGNMENT UTILITIES
    textLeft: {
        textAlign: "left",
    },
    textCenter: {
        textAlign: "center",
    },
    textRight: {
        textAlign: "right",
    },

    // SPACING UTILITIES FOR TEXT
    textSpacingTight: {
        letterSpacing: TYPOGRAPHY.letterSpacing.tight,
    },
    textSpacingNormal: {
        letterSpacing: TYPOGRAPHY.letterSpacing.normal,
    },
    textSpacingWide: {
        letterSpacing: TYPOGRAPHY.letterSpacing.wide,
    },
    textSpacingWider: {
        letterSpacing: TYPOGRAPHY.letterSpacing.wider,
    },
    textSpacingWidest: {
        letterSpacing: TYPOGRAPHY.letterSpacing.widest,
    },

    // TEXT TRANSFORM UTILITIES
    textUppercase: {
        textTransform: "uppercase",
    },
    textCapitalize: {
        textTransform: "capitalize",
    },
    textLowercase: {
        textTransform: "lowercase",
    },
});
