import { COLORS } from "@/shared/constants/COLORS";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        gap: 16,
    },
    banner: {
        backgroundColor: "rgba(255,255,255,0.08)",
        padding: 12,
        borderRadius: 8,
    },
    section: {
        gap: 10,
    },
    sectionTitle: {
        color: COLORS.white,
        fontWeight: "600",
    },
    helpText: {
        color: COLORS.bodyText,
    },
    keyBox: {
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.25)",
        borderRadius: 6,
        padding: 10,
        backgroundColor: "rgba(0,0,0,0.1)",
    },
    keyText: {
        color: COLORS.white,
        fontFamily: "Courier",
        fontSize: 13,
        letterSpacing: 0.7,
    },
    warning: {
        color: "#ffad33",
    },
    success: {
        color: "#6EE7B7",
        marginTop: 8,
    },
    separator: {
        height: 1,
        backgroundColor: "rgba(255,255,255,0.12)",
        marginVertical: 4,
    },
});
