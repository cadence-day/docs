import React from "react";
import { Text, TextStyle } from "react-native";
import { cadenceUIStyles } from "./styles";

interface CdTextProps {
  children: React.ReactNode;
  variant?: "title" | "body" | "caption" | "error" | "message" | "link";
  size?: "small" | "medium" | "large";
  style?: TextStyle;
  numberOfLines?: number;
}

export const CdText: React.FC<CdTextProps> = ({
  children,
  variant = "body",
  size = "medium",
  style,
  numberOfLines,
}) => {
  const variantStyleMap: Record<
    NonNullable<CdTextProps["variant"]>,
    TextStyle | undefined
  > = {
    title: cadenceUIStyles.cdTextTitle,
    body: cadenceUIStyles.cdTextBody,
    caption: cadenceUIStyles.cdTextCaption,
    error: cadenceUIStyles.cdTextError,
    message: cadenceUIStyles.cdTextMessage,
    link: cadenceUIStyles.cdTextLink,
  };

  const sizeStyleMap: Record<
    NonNullable<CdTextProps["size"]>,
    TextStyle | undefined
  > = {
    small: cadenceUIStyles.cdTextSmall,
    medium: cadenceUIStyles.cdTextMedium,
    large: cadenceUIStyles.cdTextLarge,
  };

  const variantStyle = variantStyleMap[variant];
  const sizeStyle = sizeStyleMap[size];
  const textStyle = [
    cadenceUIStyles.cdTextBase,
    variantStyle,
    sizeStyle,
    style,
  ];

  return (
    <Text style={textStyle} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
};
