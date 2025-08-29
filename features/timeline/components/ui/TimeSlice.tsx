import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Timeslice } from "@/shared/types/models";
import { formatTimeForDisplay } from "@/shared/utils/datetime";
import { useDateTimePreferences } from "@/shared/hooks/useDateTimePreferences";
import NoteIcon from "@/shared/components/icons/NoteIcon";
import Ionicons from "@expo/vector-icons/Ionicons";
import { getContrastColor } from "../../utils";
import { styles } from "../../styles";

interface TimeSliceProps {
  timeslice: Timeslice;
  style?: any;
  color?: string;
  iconType?: "note" | "plus";
  onIconPress?: () => void;
  usePreferences?: boolean; // Whether to use user preferences for formatting
}

const TimeSlice: React.FC<TimeSliceProps> = ({
  timeslice,
  style,
  color,
  iconType,
  onIconPress,
  usePreferences = false,
}) => {
  // Get user preferences if requested
  const userPreferences = useDateTimePreferences();

  // Calculate contrast color for icons based on background color
  const backgroundColor = color || "#0074D9";
  const iconColor = getContrastColor(backgroundColor);

  return (
    <View style={[styles.timeSliceContainer, style]}>
      <Text style={styles.timeSliceText}>
        {timeslice.start_time
          ? formatTimeForDisplay(timeslice.start_time, userPreferences)
          : "--:--"}
      </Text>
      <View
        style={[styles.timeSliceBox, { backgroundColor: color || "#0074D9" }]}>
        <View style={styles.timeSliceIconContainer}>
          {iconType === "note" &&
            (onIconPress ? (
              <TouchableOpacity
                onPress={onIconPress}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <NoteIcon color={iconColor} size="normal" />
              </TouchableOpacity>
            ) : (
              <NoteIcon color={iconColor} size="normal" />
            ))}
          {iconType === "plus" &&
            (onIconPress ? (
              <TouchableOpacity
                onPress={onIconPress}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="add" size={20} color={iconColor} />
              </TouchableOpacity>
            ) : (
              <Ionicons name="add" size={20} color={iconColor} />
            ))}
        </View>
      </View>
    </View>
  );
};

export default TimeSlice;
