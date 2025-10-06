/**
 * Shared Component Styles
 *
 * Centralized styling for shared components like Toast, DialogHost, etc.
 * This file contains all style definitions that were previously inline in component files.
 */

import { COLORS } from "@/shared/constants/COLORS";
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
        flexDirection: "row",
        alignItems: "flex-start",
        paddingHorizontal: 24,
        paddingVertical: 16,
        minHeight: 64,
    },
    toastIconContainer: {
        marginRight: 16,
        marginTop: 4,
    },
    toastTextContainer: {
        flex: 1,
        marginRight: 16,
    },
    toastTitle: {
        color: COLORS.neutral.white,
        fontSize: 16,
        fontWeight: "600",
        lineHeight: 20,
        marginBottom: 4,
    },
    toastBody: {
        color: COLORS.neutral.white,
        fontSize: 14,
        fontWeight: "400",
        lineHeight: 18,
        opacity: 0.9,
    },
    toastDismissButton: {
        padding: 12,
        borderRadius: 24,
        backgroundColor: COLORS.dark.interactive.hover,
        justifyContent: "center",
        alignItems: "center",
    },

    // DialogHost styles
    dialogHostOverlay: {
        flex: 1,
        backgroundColor: COLORS.dark.background.overlay,
        justifyContent: "center",
        alignItems: "center",
    },
    dialogHostContainer: {
        padding: 24,
        borderRadius: 24,
        backgroundColor: COLORS.dark.background.secondary,
        marginHorizontal: 24,
        maxWidth: 400,
        width: "100%",
    },
    dialogHostTitle: {
        ...TYPOGRAPHY.heading.h3,
        color: COLORS.dark.text.primary,
        marginBottom: 16,
        textAlign: "center",
    },
    dialogHostMessage: {
        ...TYPOGRAPHY.body.medium,
        color: COLORS.dark.text.primary,
        marginBottom: 24,
        textAlign: "center",
    },
    dialogHostButtonContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        gap: 16,
    },
    dialogHostButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    dialogHostButtonPrimary: {
        backgroundColor: COLORS.brand.primary,
    },
    dialogHostButtonSecondary: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: COLORS.brand.primary,
    },
    dialogHostButtonText: {
        ...TYPOGRAPHY.body.medium,
        color: COLORS.dark.text.primary,
        fontWeight: TYPOGRAPHY.weights.semibold,
    },
});
