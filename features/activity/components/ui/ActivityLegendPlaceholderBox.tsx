import { styles } from "@/features/activity/styles";
import React from "react";
import { View, ViewStyle } from "react-native";

interface ActivityLegendPlaceholderBoxProps {
  style?: ViewStyle;
  boxHeight?: number;
  boxWidth?: number | `${number}%`;
  showTitle?: boolean;
  marginBottom?: number;
}

export const ActivityLegendPlaceholderBox: React.FC<
  ActivityLegendPlaceholderBoxProps
> = ({
  style,
  boxHeight = 28,
  boxWidth = "100%",
  showTitle = true,
  marginBottom = 8,
}) => {
  return (
    <View style={[styles.activityBoxContainer, style]}>
      <View
        style={[
          styles.activityBox,
          {
            backgroundColor: "#666",
            height: boxHeight,
            width: boxWidth,
            marginBottom: marginBottom,
          } as ViewStyle,
        ]}
      />

      {showTitle && (
        <View style={styles.placeholderTextContainer}>
          <View
            style={[
              styles.placeholderBlock,
              {
                width: "75%",
                height: 10,
                marginBottom: 4,
              },
            ]}
          />
          <View
            style={[
              styles.placeholderBlock,
              {
                width: "45%",
                height: 10,
              },
            ]}
          />
        </View>
      )}
    </View>
  );
};
