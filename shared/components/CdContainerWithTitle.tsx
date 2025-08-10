// Across dialogs for container with a specific title. (TimesliceInformationm, ActivityCreate, ActivityEdit, etc.)

// Arguments:
// - title: string
// - children: React.ReactNode

import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";

interface CdContainerWithTitleProps {
  title: string;
  children: React.ReactNode;
  style?: ViewStyle;
  containerStyle?: ViewStyle;
}

const CdContainerWithTitle: React.FC<CdContainerWithTitleProps> = ({
  title,
  children,
  style,
  containerStyle,
}) => {
  return (
    <View style={[styles.wrapper, style]}>
      <Text style={styles.title}>{title}</Text>
      <View style={[styles.container, containerStyle]}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    height: "100%",
    paddingTop: 20,
  },
  title: {
    color: "#888",
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 16,
    textTransform: "uppercase",
  },
  container: {
    flex: 1,
    width: "100%",
  },
});

export default CdContainerWithTitle;
