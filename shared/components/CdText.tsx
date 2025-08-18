import React from "react";
import { Text, StyleSheet, TextStyle } from "react-native";

interface CdTextProps {
  children: React.ReactNode;
  variant?: "title" | "body" | "caption" | "error" | "message" | "link";
  size?: "small" | "medium" | "large";
  style?: TextStyle;
  numberOfLines?: number;
}

const CdText: React.FC<CdTextProps> = ({
  children,
  variant = "body",
  size = "medium",
  style,
  numberOfLines,
}) => {
  const textStyle = [
    localStyles.text,
    localStyles[`${variant}Text`],
    localStyles[`${size}Text`],
    style,
  ];

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
  
  // Variant styles
  titleText: {
    textAlign: "center",
    fontWeight: "600",
  },
  bodyText: {
    fontWeight: "400",
  },
  captionText: {
    fontWeight: "300",
    opacity: 0.8,
  },
  errorText: {
    color: "#FE4437",
    textTransform: "uppercase",
  },
  messageText: {
    color: "#4A90E2",
    textTransform: "uppercase",
  },
  linkText: {
    color: "#FFFFFF",
    textDecorationLine: "underline",
  },
  
  // Size styles
  smallText: {
    fontSize: 12,
  },
  mediumText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 20,
  },
});

export default CdText;
