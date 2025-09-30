/**
 * Shared Component Styles
 *
 * Centralized styling for shared components like Toast, DialogHost, etc.
 * This file contains all style definitions that were previously inline in component files.
 */

import { CONTAINER } from "@/shared/constants/CONTAINER";
import { TYPOGRAPHY } from "@/shared/constants/TYPOGRAPHY";
import { StyleSheet } from "react-native";

export const sharedComponentStyles = StyleSheet.create({
    // Toast styles
    toastContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        width: "100%",
    },
    toastGradientContainer: {
        borderRadius: 0,
        marginHorizontal: 0,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 10,
    },
    toastContent: {
        ...CONTAINER.basic.row,
        alignItems: "flex-start",
        ...CONTAINER.padding.horizontal.lg,
        ...CONTAINER.padding.vertical.md,
        minHeight: 64,
    },
    toastIconContainer: {
        ...CONTAINER.margin.right.md,
        ...CONTAINER.margin.top.xs,
    },
    toastTextContainer: {
        flex: 1,
        ...CONTAINER.margin.right.md,
    },
    toastTitle: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
        lineHeight: 20,
        ...CONTAINER.margin.bottom.xs,
    },
    toastBody: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "400",
        lineHeight: 18,
        opacity: 0.9,
    },
    toastDismissButton: {
        ...CONTAINER.padding.base,
        ...CONTAINER.border.radius.lg,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        justifyContent: "center",
        alignItems: "center",
    },

    // DialogHost styles
    dialogHostOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    dialogHostContainer: {
        ...CONTAINER.padding.lg,
        ...CONTAINER.border.radius.lg,
        backgroundColor: "#1a1a1a",
        ...CONTAINER.margin.horizontal.lg,
        maxWidth: 400,
        width: "100%",
    },
    dialogHostTitle: {
        ...TYPOGRAPHY.heading.h3,
        color: "#FFFFFF",
        ...CONTAINER.margin.bottom.md,
        textAlign: "center",
    },
    dialogHostMessage: {
        ...TYPOGRAPHY.body.medium,
        color: "#FFFFFF",
        ...CONTAINER.margin.bottom.lg,
        textAlign: "center",
    },
    dialogHostButtonContainer: {
        ...CONTAINER.basic.row,
        justifyContent: "space-around",
        ...CONTAINER.gap.md,
    },
    dialogHostButton: {
        flex: 1,
        ...CONTAINER.padding.vertical.md,
        ...CONTAINER.border.radius.base,
        alignItems: "center",
    },
    dialogHostButtonPrimary: {
        backgroundColor: "#6366F1",
    },
    dialogHostButtonSecondary: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: "#6366F1",
    },
    dialogHostButtonText: {
        ...TYPOGRAPHY.body.medium,
        color: "#FFFFFF",
        fontWeight: TYPOGRAPHY.weights.semibold,
    },
});
