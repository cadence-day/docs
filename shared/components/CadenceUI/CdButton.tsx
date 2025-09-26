import React from "react";
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

interface CdButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "text" | "destructive";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const CdButton: React.FC<CdButtonProps> = ({
  title,
  onPress,
  variant = "outline",
  size = "medium",
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const getVariantButtonStyle = (variant: CdButtonProps["variant"]) => {
    switch (variant) {
      case "primary":
        return localStyles.primaryButton;
      case "secondary":
        return localStyles.secondaryButton;
      case "outline":
        return localStyles.outlineButton;
      case "text":
        return localStyles.textButton;
      case "destructive":
        return localStyles.destructiveButton;
      default:
        return localStyles.outlineButton;
    }
  };

  const getSizeButtonStyle = (size: CdButtonProps["size"]) => {
    switch (size) {
      case "small":
        return localStyles.smallButton;
      case "medium":
        return localStyles.mediumButton;
      case "large":
        return localStyles.largeButton;
      default:
        return localStyles.mediumButton;
    }
  };

  const getVariantButtonTextStyle = (variant: CdButtonProps["variant"]) => {
    switch (variant) {
      case "primary":
        return localStyles.primaryButtonText;
      case "secondary":
        return localStyles.secondaryButtonText;
      case "outline":
        return localStyles.outlineButtonText;
      case "text":
        return localStyles.textButtonText;
      case "destructive":
        return localStyles.destructiveButtonText;
      default:
        return localStyles.outlineButtonText;
    }
  };

  const getSizeButtonTextStyle = (size: CdButtonProps["size"]) => {
    switch (size) {
      case "small":
        return localStyles.smallButtonText;
      case "medium":
        return localStyles.mediumButtonText;
      case "large":
        return localStyles.largeButtonText;
      default:
        return localStyles.mediumButtonText;
    }
  };

  const buttonStyle = [
    localStyles.button,
    getVariantButtonStyle(variant),
    getSizeButtonStyle(size),
    fullWidth && localStyles.fullWidth,
    disabled && localStyles.disabledButton,
    style,
  ];

  const buttonTextStyle = [
    localStyles.buttonText,
    getVariantButtonTextStyle(variant),
    getSizeButtonTextStyle(size),
    disabled && localStyles.disabledButtonText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={buttonTextStyle}>{title}</Text>
    </TouchableOpacity>
  );
};

const localStyles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
  },

  // Variant styles
  outlineButton: {
    borderWidth: 1,
    borderColor: "#FFFFFF",
    backgroundColor: "transparent",
  },
  primaryButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 0,
  },
  secondaryButton: {
    backgroundColor: "#2B2B2B",
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  textButton: {
    borderWidth: 0,
    padding: 0,
  },

  // Size styles
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minWidth: 100,
  },
  mediumButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    minWidth: 140,
  },
  largeButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 160,
  },

  // Width styles
  fullWidth: {
    width: "100%",
  },

  // Disabled styles
  disabledButton: {
    opacity: 0.5,
  },

  // Text styles
  buttonText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
  },

  // Variant text styles
  outlineButtonText: {
    color: "#FFFFFF",
  },
  primaryButtonText: {
    color: "#2B2B2B",
  },
  secondaryButtonText: {
    color: "#FFFFFF",
  },
  textButtonText: {
    color: "#FFFFFF",
    textDecorationLine: "underline",
  },

  // Size text styles
  smallButtonText: {
    fontSize: 14,
  },
  mediumButtonText: {
    fontSize: 16,
  },
  largeButtonText: {
    fontSize: 18,
  },

  // Disabled text styles
  disabledButtonText: {
    opacity: 0.7,
  },

  // Destructive styles
  destructiveButton: {
    backgroundColor: "#FF3B30",
    borderWidth: 0,
  },
  destructiveButtonText: {
    color: "#FFFFFF",
  },
});
