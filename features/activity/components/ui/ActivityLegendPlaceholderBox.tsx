import { styles } from "@/features/activity/styles";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import React from "react";
import { DimensionValue, View, ViewStyle } from "react-native";
interface ActivityLegendPlaceholderBoxProps {
  style?: ViewStyle;
  boxHeight?: number;
  boxWidth?: DimensionValue;
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
  const boxStyle: ViewStyle = {
    backgroundColor: "#666",
    height: boxHeight,
    width: boxWidth,
    marginBottom,
  };

  const placeholderLarge: ViewStyle = {
    width: "75%",
    height: 10,
    marginBottom: 4,
  };

  const placeholderSmall: ViewStyle = {
    width: "45%",
    height: 10,
  };

  return isLiquidGlassAvailable() ? (
    <View style={[styles.activityBoxContainer, style]}>
      <GlassView
        glassEffectStyle="regular"
        style={[styles.activityBox, boxStyle]}
      />

      {showTitle && (
        <View style={styles.placeholderTextContainer}>
          <GlassView
            glassEffectStyle="regular"
            style={[styles.placeholderBlock, placeholderLarge]}
          />
          <GlassView
            glassEffectStyle="regular"
            style={[styles.placeholderBlock, placeholderSmall]}
          />
        </View>
      )}
    </View>
  ) : (
    <View style={[styles.activityBoxContainer, style]}>
      <View style={[styles.activityBox, boxStyle]} />

      {showTitle && (
        <View style={styles.placeholderTextContainer}>
          <View style={[styles.placeholderBlock, placeholderLarge]} />
          <View style={[styles.placeholderBlock, placeholderSmall]} />
        </View>
      )}
    </View>
  );
};
