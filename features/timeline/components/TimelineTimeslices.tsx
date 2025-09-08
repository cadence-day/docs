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
  // Optional date that these timeslices represent (local date).
  dateForDisplay?: Date;
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
  dateForDisplay,
}) => {
  // compute start of the provided display date (or today) in local timezone
  const displayDate = dateForDisplay ? new Date(dateForDisplay) : new Date();
  const startOfDisplayDay = new Date(displayDate);
  startOfDisplayDay.setHours(0, 0, 0, 0);
  const isTodayDisplay =
    startOfDisplayDay.toDateString() === new Date().toDateString();

  const visibleTimeslices = timeslices.filter((ts) => {
    // keep timeslices that don't have a start_time (defensive)
    if (!ts.start_time) return true;

    const parsed =
      typeof ts.start_time === "number"
        ? ts.start_time
        : Date.parse(String(ts.start_time));

    // if we can't parse the time, keep the timeslice to avoid hiding data
    if (Number.isNaN(parsed)) return true;

    return Number(parsed) >= startOfDisplayDay.getTime();
  });

  return (
    <>
      {visibleTimeslices.map((ts, index) => {
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
              // don't pass a color for empty timeslices — let TimeSlice
              // fallback to its default background color and avoid invalid
              // color parsing in contrast utilities
              color={isEmpty ? undefined : (activity?.color ?? "#d9d9d9")}
              iconType={iconType}
              isToday={isTodayDisplay}
              onIconPress={isEmpty ? undefined : () => onIconPress(ts)}
            />
          </TouchableOpacity>
        );
      })}
    </>
  );
};
