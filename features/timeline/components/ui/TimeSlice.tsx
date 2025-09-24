import NoteIcon from "@/shared/components/icons/NoteIcon";
import { COLORS } from "@/shared/constants/COLORS";
import { HIT_SLOP_10 } from "@/shared/constants/hitSlop";
import { useDeviceDateTime } from "@/shared/hooks/useDeviceDateTime";
import { locale } from "@/shared/locales";
import { Timeslice } from "@/shared/types/models";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import { getShadowStyle, ShadowLevel } from "@/shared/utils/shadowUtils";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import {
  StyleProp,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
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
const MODE_STYLES: Record<Mode, StyleProp<ViewStyle>> = {
  [Mode.Faded]: { opacity: 0.3, borderColor: COLORS.primary, borderWidth: 1 },
  [Mode.Today]: { borderColor: COLORS.primary, borderWidth: 1 },
  [Mode.Past]: { borderColor: COLORS.secondary, borderWidth: 2 },
  [Mode.Selected]: { borderColor: COLORS.primary, borderWidth: 3 },
  [Mode.Current]: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    ...getShadowStyle(ShadowLevel.Low),
  },
};

const TimeSlice: React.FC<TimeSliceProps> = ({
  timeslice,
  color,
  onIconPress,
  modes = [Mode.Today],
  metadata,
  iconType,
}) => {
  const { prefs, formatTime } = useDeviceDateTime();
  // Determine hour format (12h vs 24h) using device prefs if available, otherwise Intl probe
  let inferredHourFormat = "24";
  if (prefs && prefs.timeFormat) {
    // If user has explicit preference like "12-hour" or starts with "12"
    inferredHourFormat = prefs.timeFormat.toString().startsWith("12")
      ? "12"
      : "24";
  } else {
    // Fallback: probe Intl to see if the locale uses a dayPeriod (AM/PM)
    const parts = new Intl.DateTimeFormat(locale, {
      hour: "numeric",
    }).formatToParts(new Date(2023, 0, 1, 13));
    const hasDayPeriod =
      parts.find((part) => part.type === "dayPeriod") !== undefined;
    inferredHourFormat = hasDayPeriod ? "12" : "24";
  }

  const finalHourFormat = inferredHourFormat;
  // Calculate contrast color for icons based on background color
  // If no color is provided (empty timeslice), don't apply a background color.
  const backgroundColor = color;
  const iconColor = backgroundColor
    ? getContrastColor(backgroundColor)
    : undefined;

  // Merge styles for all provided modes so modes are cumulative. Later modes
  // in the array will override earlier ones when keys collide. Build an array
  // of style objects; RN will flatten arrays passed to the `style` prop.
  const combinedModeStyleArray = (modes || [])
    .map((m: Mode) => MODE_STYLES[m])
    .filter(Boolean) as Array<StyleProp<ViewStyle>>;

  // Use explicit props when provided; otherwise fall back to metadata-derived values.
  const displayNoteCount =
    typeof metadata?.note?.noteCount === "number"
      ? metadata.note.noteCount
      : (metadata?.note?.noteCount ?? 0);

  const displayEnergy =
    typeof metadata?.state?.energy !== "undefined"
      ? metadata.state.energy
      : (metadata?.state?.energy ?? null);

  // compute text style once to avoid repeated branching in render
  let textStyle: StyleProp<TextStyle>;
  if (modes.includes(Mode.Current)) {
    textStyle =
      finalHourFormat === "12"
        ? styles.currentTimeLabel12
        : styles.currentTimeLabel;
  } else {
    textStyle =
      finalHourFormat === "12" ? styles.timeSliceText12 : styles.timeSliceText;
  }

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
            // Use hook-based formatter
            return formatTime(timeslice.start_time);
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
          ...combinedModeStyleArray,
        ]}
      >
        <View style={[styles.timeSliceIconContainer]}>
          {iconType === "note" &&
            (onIconPress ? (
              <TouchableOpacity onPress={onIconPress} hitSlop={HIT_SLOP_10}>
                <NoteIcon color={iconColor} size="normal" />
              </TouchableOpacity>
            ) : (
              <NoteIcon color={iconColor} size="normal" />
            ))}
          {iconType === "plus" &&
            (onIconPress ? (
              <TouchableOpacity onPress={onIconPress} hitSlop={HIT_SLOP_10}>
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
            onPress={onIconPress}
          />
        </View>
      </View>
    </View>
  );
};

export default TimeSlice;
