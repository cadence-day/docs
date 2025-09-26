import React from "react";
import { StyleSheet, Text, TextStyle } from "react-native";

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
    title: localStyles.titleText,
    body: localStyles.bodyText,
    caption: localStyles.captionText,
    error: localStyles.errorText,
    message: localStyles.messageText,
    link: localStyles.linkText,
  };

  const sizeStyleMap: Record<
    NonNullable<CdTextProps["size"]>,
    TextStyle | undefined
  > = {
    small: localStyles.smallText,
    medium: localStyles.mediumText,
    large: localStyles.largeText,
  };

  const variantStyle = variantStyleMap[variant];
  const sizeStyle = sizeStyleMap[size];
  const textStyle = [localStyles.text, variantStyle, sizeStyle, style];

  return (
    <Text style={textStyle} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
};

const localStyles = StyleSheet.create({
  text: {
    color: "#FFFFFF",
  },
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  bodyText: {
    fontSize: 16,
    fontWeight: "normal",
  },
  captionText: {
    fontSize: 12,
    color: "#AAAAAA",
  },
  errorText: {
    color: "#FF4D4F",
    fontWeight: "bold",
  },
  messageText: {
    fontSize: 15,
    color: "#00B894",
  },
  linkText: {
    color: "#3498DB",
    textDecorationLine: "underline",
  },
  smallText: {
    fontSize: 12,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 20,
  },
});
