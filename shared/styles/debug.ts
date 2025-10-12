import { StyleSheet } from "react-native";
import { COLORS } from "../constants/COLORS";
import { CONTAINER } from "../constants/CONTAINER";
import { generalStyles } from "./general";

export const debugStyles = StyleSheet.create({
    container: {
        ...generalStyles.container,
        backgroundColor: COLORS.neutral.white,
        ...CONTAINER.padding.xl,
        borderColor: COLORS.primary,
        ...CONTAINER.border.width.thin,
        borderStyle: "dotted",
    },
    debugButton: {
        backgroundColor: COLORS.brand.primary,
        ...CONTAINER.padding.md,
        ...CONTAINER.border.radius.sm,
        ...CONTAINER.layout.align.center,
        ...CONTAINER.margin.bottom.md,
    },
    dangerButton: {
        backgroundColor: COLORS.semantic.error,
    },
});
