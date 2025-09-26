import { StyleSheet } from "react-native";
import { COLORS } from "../constants/COLORS";

export const generalStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    h1: {
        fontFamily: "FoundersGrotesk-Regular",
        fontSize: 24,
    },
    h2: {
        fontFamily: "FoundersGrotesk-Regular",
        fontSize: 20,
    },
    clickableText: {
        fontSize: 14,
        color: "#444",
        textDecorationLine: "underline",
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.light.subtitle,
    },
    disabledText: {
        color: COLORS.light.disabled,
    },
    smallText: {
        fontFamily: "FoundersGrotesk-Regular",
        fontSize: 10,
        textTransform: "uppercase",
        letterSpacing: 1.2,
        color: COLORS.light.text,
        verticalAlign: "middle",
    },
    focusedText: {
        textDecorationLine: "underline",
        fontWeight: "600",
    },
    outlineDiscreetButton: {
        borderColor: "rgba(255, 255, 255, 0.3)",
    },
    discreetText: {
        color: "rgba(255, 255, 255, 0.3)",
    },
});
