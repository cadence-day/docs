import { StyleSheet } from "react-native";
import { COLORS } from "../constants/COLORS";
import { CONTAINER } from "../constants/CONTAINER";
import { TYPOGRAPHY } from "../constants/TYPOGRAPHY";

export const generalStyles = StyleSheet.create({
    // LAYOUT CONTAINERS
    container: {
        ...CONTAINER.basic.centeredView,
    },

    // Common container patterns
    flexContainer: {
        ...CONTAINER.basic.view,
    },
    centeredContainer: {
        ...CONTAINER.basic.centeredView,
    },
    rowContainer: {
        ...CONTAINER.basic.row,
    },
    columnContainer: {
        ...CONTAINER.basic.column,
    },
    spaceBetweenContainer: {
        ...CONTAINER.basic.spaceBetween,
    },

    // Content containers
    screenContainer: {
        ...CONTAINER.content.screen,
    },
    sectionContainer: {
        ...CONTAINER.content.section,
    },
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
        color: COLORS.light.text,
    },
    bodyMedium: {
        ...TYPOGRAPHY.body.medium,
        color: COLORS.light.text,
    },
    bodySmall: {
        ...TYPOGRAPHY.body.small,
        color: COLORS.light.text,
    },

    // LEGACY STYLES (maintained for compatibility)
    clickableText: {
        ...TYPOGRAPHY.interactive.clickable,
        color: "#444",
    },
    subtitle: {
        ...TYPOGRAPHY.body.medium,
        color: COLORS.light.subtitle,
    },
    smallText: {
        ...TYPOGRAPHY.label.small,
        color: COLORS.light.text,
        textAlign: "center",
        paddingHorizontal: 4,
    },
    focusedText: {
        ...TYPOGRAPHY.interactive.focused,
    },

    // LABEL STYLES
    labelLarge: {
        ...TYPOGRAPHY.label.large,
        color: COLORS.light.text,
    },
    labelMedium: {
        ...TYPOGRAPHY.label.medium,
        color: COLORS.light.text,
    },
    labelSmall: {
        ...TYPOGRAPHY.label.small,
        color: COLORS.light.text,
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
        color: COLORS.primary,
    },
    clickableTextPrimary: {
        ...TYPOGRAPHY.interactive.clickable,
        color: COLORS.primary,
    },
    clickableTextSecondary: {
        ...TYPOGRAPHY.interactive.clickable,
        color: COLORS.secondary,
    },

    // STATUS TEXT STYLES
    errorText: {
        ...TYPOGRAPHY.specialized.status.error,
        color: COLORS.error,
    },
    successText: {
        ...TYPOGRAPHY.specialized.status.success,
        color: COLORS.quinary, // sage green
    },
    warningText: {
        ...TYPOGRAPHY.specialized.status.error,
        color: COLORS.tertiary, // coral red
    },

    // SPECIALIZED TEXT STYLES
    timeText: {
        ...TYPOGRAPHY.specialized.time.regular,
        color: COLORS.light.text,
    },
    timeTextCompact: {
        ...TYPOGRAPHY.specialized.time.compact,
        color: COLORS.light.text,
    },
    tagText: {
        ...TYPOGRAPHY.specialized.tag,
        color: COLORS.white,
    },
    metadataText: {
        ...TYPOGRAPHY.specialized.metadata,
        color: COLORS.bodyText,
    },
    codeText: {
        ...TYPOGRAPHY.specialized.code,
        color: COLORS.light.text,
    },
    inputText: {
        ...TYPOGRAPHY.specialized.input,
        color: COLORS.light.text,
    },
    placeholderText: {
        ...TYPOGRAPHY.specialized.placeholder,
        color: COLORS.placeholderText,
    },

    // STATE-BASED TEXT STYLES
    disabledText: {
        color: COLORS.light.disabled,
    },
    selectedText: {
        fontWeight: TYPOGRAPHY.weights.semibold,
    },
    highlightedText: {
        backgroundColor: "rgba(102, 70, 236, 0.1)", // primary color with low opacity
        borderRadius: 4,
        paddingHorizontal: 2,
    },

    // UTILITY BUTTON STYLES (non-text)
    outlineDiscreetButton: {
        borderColor: "rgba(255, 255, 255, 0.3)",
    },
    discreetText: {
        color: "rgba(255, 255, 255, 0.3)",
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
