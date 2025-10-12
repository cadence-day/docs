/**
 * Shared Component Styles
 *
 * Centralized styling for shared components like Toast, DialogHost, etc.
 * This file contains all style definitions that were previously inline in component files.
 */

import { COLORS } from "@/shared/constants/COLORS";
import { CONTAINER } from "@/shared/constants/CONTAINER";
import { TYPOGRAPHY } from "@/shared/constants/TYPOGRAPHY";
import { StyleSheet } from "react-native";

export const sharedComponentStyles = StyleSheet.create({
    // Toast styles
    toastContainer: {
        ...CONTAINER.layout.position.absolute,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        ...CONTAINER.size.width.full,
    },
    toastGradientContainer: {
        ...CONTAINER.border.radius.none,
        ...CONTAINER.margin.horizontal.none,
        shadowColor: COLORS.neutral.black,
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 10,
    },
    toastContent: {
        ...CONTAINER.layout.direction.row,
        ...CONTAINER.layout.align.start,
        ...CONTAINER.padding.horizontal["2xl"],
        ...CONTAINER.padding.vertical.lg,
        minHeight: 64,
    },
    toastIconContainer: {
        ...CONTAINER.margin.right.lg,
        ...CONTAINER.margin.top.sm,
    },
    toastTextContainer: {
        ...CONTAINER.layout.flex.grow,
        ...CONTAINER.margin.right.lg,
    },
    toastTitle: {
        color: COLORS.neutral.white,
        ...TYPOGRAPHY.button.medium,
        lineHeight: TYPOGRAPHY.lineHeights.normal,
        ...CONTAINER.margin.bottom.sm,
    },
    toastBody: {
        color: COLORS.neutral.white,
        ...TYPOGRAPHY.body.medium,
        lineHeight: TYPOGRAPHY.lineHeights.base,
        ...CONTAINER.opacity.mostVisible,
    },
    toastDismissButton: {
        ...CONTAINER.padding.md,
        ...CONTAINER.layout.justify.center,
        ...CONTAINER.layout.align.center,
    },

    // DialogHost styles
    dialogHostOverlay: {
        ...CONTAINER.layout.flex.grow,
        backgroundColor: COLORS.dark.background.overlay,
        ...CONTAINER.layout.justify.center,
        ...CONTAINER.layout.align.center,
    },
    dialogHostContainer: {
        ...CONTAINER.padding["2xl"],
        ...CONTAINER.border.radius["2xl"],
        backgroundColor: COLORS.dark.background.secondary,
        ...CONTAINER.margin.horizontal["2xl"],
        maxWidth: 400,
        ...CONTAINER.size.width.full,
    },
    dialogHostTitle: {
        ...TYPOGRAPHY.heading.h3,
        color: COLORS.dark.text.primary,
        ...CONTAINER.margin.bottom.lg,
        textAlign: "center",
    },
    dialogHostMessage: {
        ...TYPOGRAPHY.body.medium,
        color: COLORS.dark.text.primary,
        ...CONTAINER.margin.bottom["2xl"],
        textAlign: "center",
    },
    dialogHostButtonContainer: {
        ...CONTAINER.layout.direction.row,
        ...CONTAINER.layout.justify.around,
        ...CONTAINER.gap.lg,
    },
    dialogHostButton: {
        ...CONTAINER.layout.flex.grow,
        ...CONTAINER.padding.vertical.lg,
        ...CONTAINER.border.radius.md,
        ...CONTAINER.layout.align.center,
    },
    dialogHostButtonPrimary: {
        backgroundColor: COLORS.brand.primary,
    },
    dialogHostButtonSecondary: {
        backgroundColor: "transparent",
        ...CONTAINER.border.width.thin,
        borderColor: COLORS.brand.primary,
    },
    dialogHostButtonText: {
        ...TYPOGRAPHY.body.medium,
        color: COLORS.dark.text.primary,
        fontWeight: TYPOGRAPHY.weights.semibold,
    },
});
