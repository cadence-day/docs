import { COLORS } from "@/shared/constants/COLORS";
import { Platform } from "react-native";

// Define an enum for shadow levels
export enum ShadowLevel {
    Low = "Low",
    Medium = "Medium",
    High = "High",
}

// Define shadow and elevation styles for each level
const shadowStyles = {
    [ShadowLevel.Low]: {
        shadowColor: COLORS.neutral.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    [ShadowLevel.Medium]: {
        shadowColor: COLORS.neutral.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    [ShadowLevel.High]: {
        shadowColor: COLORS.neutral.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
};

// Utility function to get shadow and elevation styles
export const getShadowStyle = (level: ShadowLevel) => {
    return Platform.select({
        ios: {
            shadowColor: shadowStyles[level].shadowColor,
            shadowOffset: shadowStyles[level].shadowOffset,
            shadowOpacity: shadowStyles[level].shadowOpacity,
            shadowRadius: shadowStyles[level].shadowRadius,
        },
        android: {
            elevation: shadowStyles[level].elevation,
        },
    });
};
