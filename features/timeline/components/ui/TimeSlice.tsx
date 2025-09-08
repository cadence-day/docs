import NoteIcon from "@/shared/components/icons/NoteIcon";
import { COLORS } from "@/shared/constants/COLORS";
import { useDateTimePreferences } from "@/shared/hooks/useDateTimePreferences";
import { Timeslice } from "@/shared/types/models";
import { formatTimeForDisplay } from "@/shared/utils/datetime";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "../../styles";
import { getContrastColor } from "../../utils";

interface TimeSliceProps {
  timeslice: Timeslice;
  style?: any;
  color?: string;
  iconType?: "note" | "plus";
  onIconPress?: () => void;
  usePreferences?: boolean; // Whether to use user preferences for formatting
  isToday?: boolean;
}

const TimeSlice: React.FC<TimeSliceProps> = ({
  timeslice,
  style,
  color,
  iconType,
  onIconPress,
  usePreferences = false,
  isToday = false,
}) => {
  // Get user preferences if requested
  const userPreferences = useDateTimePreferences();

  // Calculate contrast color for icons based on background color
  // If no color is provided (empty timeslice), don't apply a background color.
  const backgroundColor = color;
  const iconColor = backgroundColor
    ? getContrastColor(backgroundColor)
    : undefined;

  return (
    <View style={[styles.timeSliceContainer, style]}>
      <Text style={styles.timeSliceText}>
        {timeslice.start_time
          ? formatTimeForDisplay(timeslice.start_time, userPreferences)
          : "--:--"}
      </Text>
      <View
        style={[
          styles.timeSliceBox,
          backgroundColor
            ? { backgroundColor: backgroundColor }
            : styles.emptyTimeslice,
          // When this timeslice is for today's date, use primary color border and thinner width
          isToday
            ? { borderColor: COLORS.primary, borderWidth: 1 }
            : { borderColor: COLORS.secondary, borderWidth: 2 },
        ]}
      >
        <View style={styles.timeSliceIconContainer}>
          {iconType === "note" &&
            (onIconPress ? (
              <TouchableOpacity
                onPress={onIconPress}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <NoteIcon color={iconColor} size="normal" />
              </TouchableOpacity>
            ) : (
              <NoteIcon color={iconColor} size="normal" />
            ))}
          {iconType === "plus" &&
            (onIconPress ? (
              <TouchableOpacity
                onPress={onIconPress}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
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
