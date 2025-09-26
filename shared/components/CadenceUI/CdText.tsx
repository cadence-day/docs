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
  let variantStyle: TextStyle | undefined;
  switch (variant) {
    case "title":
      variantStyle = localStyles.titleText;
      break;
    case "body":
      variantStyle = localStyles.bodyText;
      break;
    case "caption":
      variantStyle = localStyles.captionText;
      break;
    case "error":
      variantStyle = localStyles.errorText;
      break;
    case "message":
      variantStyle = localStyles.messageText;
      break;
    case "link":
      variantStyle = localStyles.linkText;
      break;
    default:
      variantStyle = undefined;
  }

  let sizeStyle: TextStyle | undefined;
  switch (size) {
    case "small":
      sizeStyle = localStyles.smallText;
      break;
    case "medium":
      sizeStyle = localStyles.mediumText;
      break;
    case "large":
      sizeStyle = localStyles.largeText;
      break;
    default:
      sizeStyle = undefined;
  }

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
