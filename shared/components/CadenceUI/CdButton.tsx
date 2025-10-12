import React from "react";
import { Text, TextStyle, TouchableOpacity, ViewStyle } from "react-native";
import { cadenceUIStyles } from "./styles";

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
        return cadenceUIStyles.cdButtonPrimary;
      case "secondary":
        return cadenceUIStyles.cdButtonSecondary;
      case "outline":
        return cadenceUIStyles.cdButtonOutline;
      case "text":
        return cadenceUIStyles.cdButtonText;
      case "destructive":
        return cadenceUIStyles.cdButtonDestructive;
      default:
        return cadenceUIStyles.cdButtonOutline;
    }
  };

  const getSizeButtonStyle = (size: CdButtonProps["size"]) => {
    switch (size) {
      case "small":
        return cadenceUIStyles.cdButtonSmall;
      case "medium":
        return cadenceUIStyles.cdButtonMedium;
      case "large":
        return cadenceUIStyles.cdButtonLarge;
      default:
        return cadenceUIStyles.cdButtonMedium;
    }
  };

  const getVariantButtonTextStyle = (variant: CdButtonProps["variant"]) => {
    switch (variant) {
      case "primary":
        return cadenceUIStyles.cdButtonTextPrimary;
      case "secondary":
        return cadenceUIStyles.cdButtonTextSecondary;
      case "outline":
        return cadenceUIStyles.cdButtonTextOutline;
      case "text":
        return cadenceUIStyles.cdButtonTextText;
      case "destructive":
        return cadenceUIStyles.cdButtonTextDestructive;
      default:
        return cadenceUIStyles.cdButtonTextOutline;
    }
  };

  const getSizeButtonTextStyle = (size: CdButtonProps["size"]) => {
    switch (size) {
      case "small":
        return cadenceUIStyles.cdButtonTextSmall;
      case "medium":
        return cadenceUIStyles.cdButtonTextMedium;
      case "large":
        return cadenceUIStyles.cdButtonTextLarge;
      default:
        return cadenceUIStyles.cdButtonTextMedium;
    }
  };

  const buttonStyle = [
    cadenceUIStyles.cdButtonBase,
    getVariantButtonStyle(variant),
    getSizeButtonStyle(size),
    fullWidth && cadenceUIStyles.cdButtonFullWidth,
    disabled && cadenceUIStyles.cdButtonDisabled,
    style,
  ];

  const buttonTextStyle = [
    cadenceUIStyles.cdButtonTextBase,
    getVariantButtonTextStyle(variant),
    getSizeButtonTextStyle(size),
    disabled && cadenceUIStyles.cdButtonTextDisabled,
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
