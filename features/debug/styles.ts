/**
 * Debug Feature Styles
 *
 * Centralized styling for debug-related components.
 */

import { CONTAINER } from "@/shared/constants/CONTAINER";
import { TYPOGRAPHY } from "@/shared/constants/TYPOGRAPHY";
import { StyleSheet } from "react-native";

export const debugStyles = StyleSheet.create({
    // DebugPanel styles (moved from component file)
    debugPanelBody: {
        ...CONTAINER.gap.md,
        ...CONTAINER.margin.top.base,
        backgroundColor: "#007bff66",
        ...CONTAINER.padding.md,
        ...CONTAINER.border.radius.base,
    },
    debugPanelStatusContainer: {
        ...CONTAINER.basic.spaceBetween,
        backgroundColor: "#0056b3",
        ...CONTAINER.padding.base,
        ...CONTAINER.border.radius.sm,
    },
    debugPanelStatusText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "500",
        flex: 1,
    },
    debugPanelButton: {
        backgroundColor: "#007bff",
        ...CONTAINER.border.radius.base,
        ...CONTAINER.padding.vertical.md,
        ...CONTAINER.padding.horizontal.lg,
    },
    debugPanelCompactButton: {
        ...CONTAINER.padding.vertical.sm,
        ...CONTAINER.padding.horizontal.md,
    },
    debugPanelWarningButton: {
        backgroundColor: "#cc6600",
    },
    debugPanelButtonWithTopMargin: {
        ...CONTAINER.margin.top.base,
    },
    debugPanelButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
        textAlign: "center",
    },
    debugPanelButtonTextSmall: {
        fontSize: TYPOGRAPHY.sizes.md,
    },
    debugPanelResultText: {
        color: "#fff",
        ...CONTAINER.margin.top.sm,
    },
    debugPanelSectionContainer: {
        ...CONTAINER.margin.top.md,
    },
    debugPanelSectionTitle: {
        color: "#fff",
        ...CONTAINER.margin.bottom.base,
    },
    debugPanelButtonRow: {
        ...CONTAINER.basic.row,
        ...CONTAINER.gap.base,
        ...CONTAINER.margin.top.base,
    },
    debugPanelNotificationContainer: {
        backgroundColor: "#0056b3",
        ...CONTAINER.padding.base,
        ...CONTAINER.border.radius.sm,
        ...CONTAINER.margin.bottom.base,
    },
    debugPanelNotificationTitle: {
        color: "#fff",
        fontWeight: TYPOGRAPHY.weights.semibold,
    },
    debugPanelNotificationText: {
        color: "#fff",
        fontSize: TYPOGRAPHY.sizes.base,
    },
    debugPanelDangerButton: {
        backgroundColor: "#cc0000",
    },
});
