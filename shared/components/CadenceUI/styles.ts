/**
 * CadenceUI Component Styles
 *
 * Centralized styling for all CadenceUI components.
 * This file contains all style definitions that were previously inline in component files.
 */

import { CONTAINER } from "@/shared/constants/CONTAINER";
import { TYPOGRAPHY } from "@/shared/constants/TYPOGRAPHY";
import { StyleSheet } from "react-native";

export const cadenceUIStyles = StyleSheet.create({
    // ScreenHeader styles
    screenHeaderContainer: {
        ...CONTAINER.basic.row,
        ...CONTAINER.basic.spaceBetween,
        ...CONTAINER.padding.horizontal.md,
        paddingTop: 40, // Extra padding to look more elegant
    },
    screenHeaderLeftSection: {
        flex: 1,
    },
    screenHeaderTitle: {
        ...TYPOGRAPHY.heading.h2,
        color: "#222",
    },
    screenHeaderSubtitleContainer: {
        ...CONTAINER.basic.row,
        ...CONTAINER.padding.vertical.xs,
        ...CONTAINER.margin.top.xs,
    },
    screenHeaderSubtitle: {
        ...TYPOGRAPHY.body.small,
        color: "#444",
    },
    screenHeaderRightSection: {
        ...CONTAINER.basic.row,
        ...CONTAINER.gap.md,
    },

    // CdText styles
    cdTextBase: {
        color: "#FFFFFF",
    },
    cdTextTitle: {
        ...TYPOGRAPHY.heading.h1,
    },
    cdTextBody: {
        ...TYPOGRAPHY.body.medium,
    },
    cdTextCaption: {
        ...TYPOGRAPHY.body.small,
        color: "#AAAAAA",
    },
    cdTextError: {
        ...TYPOGRAPHY.specialized.status.error,
        color: "#FF4D4F",
        fontWeight: TYPOGRAPHY.weights.bold,
    },
    cdTextMessage: {
        fontSize: TYPOGRAPHY.sizes.md,
        color: "#00B894",
    },
    cdTextLink: {
        ...TYPOGRAPHY.interactive.link,
        color: "#3498DB",
    },
    cdTextSmall: {
        fontSize: TYPOGRAPHY.sizes.base,
    },
    cdTextMedium: {
        fontSize: TYPOGRAPHY.sizes.lg,
    },
    cdTextLarge: {
        fontSize: TYPOGRAPHY.sizes["2xl"],
    },

    // CdButton styles
    cdButtonBase: {
        alignItems: "center",
        justifyContent: "center",
    },
    // CdButton variant styles
    cdButtonOutline: {
        borderWidth: 1,
        borderColor: "#FFFFFF",
        backgroundColor: "transparent",
    },
    cdButtonPrimary: {
        backgroundColor: "#FFFFFF",
        borderWidth: 0,
    },
    cdButtonSecondary: {
        backgroundColor: "#2B2B2B",
        borderWidth: 1,
        borderColor: "#FFFFFF",
    },
    cdButtonText: {
        borderWidth: 0,
        padding: 0,
    },
    cdButtonDestructive: {
        backgroundColor: "#FF3B30",
        borderWidth: 0,
    },
    // CdButton size styles
    cdButtonSmall: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        minWidth: 100,
    },
    cdButtonMedium: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        minWidth: 140,
    },
    cdButtonLarge: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        minWidth: 160,
    },
    // CdButton width styles
    cdButtonFullWidth: {
        width: "100%",
    },
    // CdButton state styles
    cdButtonDisabled: {
        opacity: 0.5,
    },
    // CdButton text styles
    cdButtonTextBase: {
        textAlign: "center",
        fontSize: 16,
        fontWeight: "500",
    },
    cdButtonTextOutline: {
        color: "#FFFFFF",
    },
    cdButtonTextPrimary: {
        color: "#2B2B2B",
    },
    cdButtonTextSecondary: {
        color: "#FFFFFF",
    },
    cdButtonTextText: {
        color: "#FFFFFF",
        textDecorationLine: "underline",
    },
    cdButtonTextDestructive: {
        color: "#FFFFFF",
    },
    cdButtonTextSmall: {
        fontSize: 14,
    },
    cdButtonTextMedium: {
        fontSize: 16,
    },
    cdButtonTextLarge: {
        fontSize: 18,
    },
    cdButtonTextDisabled: {
        opacity: 0.7,
    },

    // CdDialog styles
    cdDialogOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    cdDialogContainer: {
        backgroundColor: "#1a1a1a",
        ...CONTAINER.border.radius.lg,
        ...CONTAINER.padding.lg,
        maxHeight: "90%",
    },

    // CdDialogHeader styles
    cdDialogHeaderContainer: {
        ...CONTAINER.basic.row,
        ...CONTAINER.basic.spaceBetween,
        ...CONTAINER.padding.bottom.md,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255, 255, 255, 0.1)",
    },
    cdDialogHeaderTitle: {
        ...TYPOGRAPHY.heading.h3,
        color: "#FFFFFF",
    },
    cdDialogHeaderCloseButton: {
        ...CONTAINER.padding.sm,
        ...CONTAINER.border.radius.sm,
    },

    // CdTextInput styles
    cdTextInputContainer: {
        ...CONTAINER.margin.bottom.md,
    },
    cdTextInputLabel: {
        ...TYPOGRAPHY.body.small,
        color: "#FFFFFF",
        ...CONTAINER.margin.bottom.xs,
    },
    cdTextInputField: {
        ...CONTAINER.padding.md,
        ...CONTAINER.border.radius.base,
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
        color: "#FFFFFF",
        ...TYPOGRAPHY.body.medium,
    },
    cdTextInputFieldFocused: {
        borderColor: "#6366F1",
    },
    cdTextInputError: {
        borderColor: "#EF4444",
    },
    cdTextInputErrorText: {
        ...TYPOGRAPHY.body.small,
        color: "#EF4444",
        ...CONTAINER.margin.top.xs,
    },

    // CdTextInputOneLine styles
    cdTextInputOneLineContainer: {
        ...CONTAINER.basic.row,
        ...CONTAINER.padding.md,
        ...CONTAINER.border.radius.base,
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
    },
    cdTextInputOneLineField: {
        flex: 1,
        color: "#FFFFFF",
        ...TYPOGRAPHY.body.medium,
    },

    // CdMoodSelector styles
    cdMoodSelectorContainer: {
        ...CONTAINER.margin.bottom.md,
    },
    cdMoodSelectorLabel: {
        ...TYPOGRAPHY.body.small,
        color: "#FFFFFF",
        ...CONTAINER.margin.bottom.xs,
    },
    cdMoodSelectorOptions: {
        ...CONTAINER.basic.row,
        justifyContent: "space-between",
    },
    cdMoodSelectorOption: {
        flex: 1,
        ...CONTAINER.padding.md,
        ...CONTAINER.border.radius.base,
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
        ...CONTAINER.margin.horizontal.xs,
    },
    cdMoodSelectorOptionSelected: {
        backgroundColor: "#6366F1",
        borderColor: "#6366F1",
    },
    cdMoodSelectorOptionText: {
        ...TYPOGRAPHY.body.small,
        color: "#FFFFFF",
        textAlign: "center",
    },

    // CdLevelIndicator styles
    cdLevelIndicatorContainer: {
        ...CONTAINER.basic.row,
        ...CONTAINER.gap.xs,
    },
    cdLevelIndicatorBar: {
        width: 4,
        height: 20,
        ...CONTAINER.border.radius.sm,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
    },
    cdLevelIndicatorBarActive: {
        backgroundColor: "#6366F1",
    },

    // CdContainerWithTitle styles
    cdContainerWithTitleContainer: {
        ...CONTAINER.margin.bottom.lg,
    },
    cdContainerWithTitleHeader: {
        ...CONTAINER.margin.bottom.md,
    },
    cdContainerWithTitleTitle: {
        ...TYPOGRAPHY.heading.h4,
        color: "#FFFFFF",
    },
    cdContainerWithTitleContent: {
        ...CONTAINER.padding.md,
        ...CONTAINER.border.radius.base,
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
    },
});
