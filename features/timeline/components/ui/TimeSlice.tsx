import NoteIcon from "@/shared/components/icons/NoteIcon";
import { COLORS } from "@/shared/constants/COLORS";
import { useDateTimePreferences } from "@/shared/hooks/useDateTimePreferences";
import { Timeslice } from "@/shared/types/models";
import { formatTimeForDisplay } from "@/shared/utils/datetime";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { TIMESLICE_CURRENT_WIDTH } from "../../constants/dimensions";
import { styles } from "../../styles";
import { getContrastColor } from "../../utils";
import MetadataVertical from "./MetadataVertical";

export enum Mode {
  Faded,
  Today,
  Past,
  Selected,
  Current,
}
interface TimeSliceProps {
  timeslice: Timeslice;
  color?: string;
  iconType?: "note" | "plus";
  onIconPress?: () => void;
  usePreferences?: boolean; // Whether to use user preferences for formatting
  modes?: Mode[]; // visual modes for conditional styling (cumulative)
  metadata?: {
    note?: {
      noteCount?: number; // Number of notes associated with the timeslice
    };
    state?: {
      energy?: number; // State number (1..5)
    };
  };
}
// Precomputed styles for each visual mode
const MODE_STYLES: Record<Mode, any> = {
  [Mode.Faded]: { opacity: 0.3, borderColor: COLORS.primary, borderWidth: 1 },
  [Mode.Today]: { borderColor: COLORS.primary, borderWidth: 1 },
  [Mode.Past]: { borderColor: COLORS.secondary, borderWidth: 2 },
  [Mode.Selected]: { borderColor: COLORS.primary, borderWidth: 3 },
  [Mode.Current]: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2, // for Android
  },
};

const TimeSlice: React.FC<TimeSliceProps> = ({
  timeslice,
  color,
  onIconPress,
  usePreferences = false,
  modes = [Mode.Today],
  metadata,
  iconType,
}) => {
  // Get user preferences if requested
  const userPreferences = usePreferences ? useDateTimePreferences() : undefined;
  // Calculate contrast color for icons based on background color
  // If no color is provided (empty timeslice), don't apply a background color.
  const backgroundColor = color;
  const iconColor = backgroundColor
    ? getContrastColor(backgroundColor)
    : undefined;

  // Merge styles for all provided modes so modes are cumulative. Later modes
  // in the array will override earlier ones when keys collide.
  const combinedModeStyle = (modes || []).reduce((acc: any, m: Mode) => {
    return { ...acc, ...(MODE_STYLES[m] || {}) };
  }, {});

  // compute text style once to avoid repeated branching in render
  const textStyle = modes.includes(Mode.Current)
    ? styles.currentTimeLabel
    : styles.timeSliceText;

  // Use explicit props when provided; otherwise fall back to metadata-derived values.
  const displayNoteCount =
    typeof metadata?.note?.noteCount === "number"
      ? metadata.note.noteCount
      : (metadata?.note?.noteCount ?? 0);

  const displayEnergy =
    typeof metadata?.state?.energy !== "undefined"
      ? metadata.state.energy
      : (metadata?.state?.energy ?? null);

  return (
    <View
      style={[
        styles.timeSliceContainer, // If Mode.Current, I want to make this a bit larger
        modes.includes(Mode.Current) ? { width: TIMESLICE_CURRENT_WIDTH } : {},
        // mode in [Mode.Faded, Mode.Selected] ? MODE_STYLES[mode] : {}, --- IGNORE ---
      ]}
    >
      <Text style={[textStyle]}>
        {(() => {
          if (!timeslice.start_time) return "--:--";
          try {
            // Prefer the shared formatter if available, fall back to locale time
            return formatTimeForDisplay
              ? formatTimeForDisplay(timeslice.start_time, userPreferences)
              : new Date(timeslice.start_time).toLocaleTimeString();
          } catch (err) {
            // Keep UI resilient; route warnings through the GlobalErrorHandler
            GlobalErrorHandler.logWarning(
              "TimeSlice: failed to format time",
              "TimeSlice:format",
              { error: err }
            );
            return new Date(timeslice.start_time).toLocaleTimeString();
          }
        })()}
      </Text>
      <View
        style={[
          styles.timeSliceBox,
          backgroundColor
            ? { backgroundColor: backgroundColor }
            : styles.emptyTimeslice,
          combinedModeStyle,
        ]}
      >
        <View style={[styles.timeSliceIconContainer]}>
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

        <View style={styles.timeSliceOverlay}>
          <MetadataVertical
            noteCount={displayNoteCount}
            energy={displayEnergy ?? null}
            iconColor={iconColor}
          />
        </View>
      </View>
    </View>
  );
};

export default TimeSlice;
