import { DEFAULT_ACTIVITY_BG } from "@/features/activity/constants";
import { styles } from "@/features/activity/styles";
import { COLORS } from "@/shared/constants/COLORS";
import { useSelectionStore } from "@/shared/stores";
import type { Activity } from "@/shared/types/models/activity";
import React from "react";
import { Text, TouchableOpacity, View, ViewStyle } from "react-native";

interface ActivityBoxProps {
  activity: Activity;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: ViewStyle;
  boxHeight?: number;
  boxWidth?: number | `${number}%`;
  showTitle?: boolean;
  marginBottom?: number;
  showHighlight?: boolean; // Optional prop to indicate if the box is selected
}

export const ActivityBox: React.FC<ActivityBoxProps> = ({
  activity,
  onPress,
  onLongPress,
  style,
  showHighlight = true,
  boxHeight = 29,
  boxWidth = "100%",
  showTitle = true,
  marginBottom = 8,
}) => {
  const selectedActivityId = useSelectionStore(
    (state) => state.selectedActivityId
  );
  const isSelected = showHighlight ? selectedActivityId === activity.id : false;

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      style={[styles.activityBoxContainer, style]}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.activityBox,
          {
            backgroundColor: activity.color || DEFAULT_ACTIVITY_BG,
            height: boxHeight,
            width: boxWidth,
            marginBottom: marginBottom,
            // Add primary color border when selected
            borderWidth: isSelected ? 2 : 0,
            borderColor: isSelected ? COLORS.primary : "transparent",
          } as ViewStyle,
        ]}
      />

      {showTitle && (
        <Text
          numberOfLines={2}
          ellipsizeMode="tail"
          style={styles.activityLabel}
        >
          {activity.name}
        </Text>
      )}
    </TouchableOpacity>
  );
};
