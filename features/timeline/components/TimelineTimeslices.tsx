// TimelineTimeslices.tsx
import { Activity, Timeslice } from "@/shared/types/models";
import React from "react";
import { TouchableOpacity } from "react-native";
import TimeSlice from "./ui/TimeSlice";

interface TimelineTimeslicesProps {
  timeslices: Timeslice[];
  activities: Activity[];
  onTimeslicePress: (timeslice: Timeslice) => void;
  onTimesliceLongPress: (timeslice: Timeslice) => void;
  onIconPress: (timeslice: Timeslice) => void;
  keyPrefix: string;
}

/**
 * Component to render a list of timeslices with proper touch handlers
 */
export const TimelineTimeslices: React.FC<TimelineTimeslicesProps> = ({
  timeslices,
  activities,
  onTimeslicePress,
  onTimesliceLongPress,
  onIconPress,
  keyPrefix,
}) => {
  return (
    <>
      {timeslices.map((ts, index) => {
        const activity = activities.find(
          (a: Activity) => a.id === ts.activity_id
        );
        const isEmpty = ts.id == null;
        const uniqueKey = ts.id ?? `${keyPrefix}-${ts.start_time}-${index}`;

        // Determine the icon type based on whether the timeslice is empty, has note_ids or not
        const iconType = isEmpty
          ? undefined // No icon for empty timeslice
          : ts.note_ids && ts.note_ids.length > 0
            ? "note" // Show note icon if there are notes
            : "plus"; // Show plus icon if there are no notes

        return (
          <TouchableOpacity
            key={uniqueKey}
            onPress={() => onTimeslicePress(ts)}
            onLongPress={() => onTimesliceLongPress(ts)}
          >
            <TimeSlice
              timeslice={ts}
              // Use an explicit RGBA transparent value instead of the string
              // 'transparent' to avoid invalid color format warnings from any
              // color parsing utilities that expect hex or rgba formats.
              color={isEmpty ? "rgba(0,0,0,0)" : (activity?.color ?? "#d9d9d9")}
              iconType={iconType}
              onIconPress={isEmpty ? undefined : () => onIconPress(ts)}
            />
          </TouchableOpacity>
        );
      })}
    </>
  );
};
