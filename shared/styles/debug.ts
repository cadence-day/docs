import { StyleSheet } from "react-native";
import { COLORS } from "../constants/COLORS";
import { generalStyles } from "./general";

export const debugStyles = StyleSheet.create({
    container: {
        ...generalStyles.container,
        backgroundColor: "#fff",
        padding: 20,
        borderColor: COLORS.primary,
        borderWidth: 1,
        borderStyle: "dotted",
    },
    debugButton: {
        backgroundColor: "#007BFF",
        padding: 10,
        borderRadius: 5,
        alignItems: "center",
        marginBottom: 10,
    },
    dangerButton: { backgroundColor: "#DC3545" },
});
