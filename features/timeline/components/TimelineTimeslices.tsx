// TimelineTimeslices.tsx
import useActivitiesStore from "@/shared/stores/resources/useActivitiesStore";
import useStatesStore from "@/shared/stores/resources/useStatesStore";
import { Activity, Timeslice } from "@/shared/types/models";
import React from "react";
import { TouchableOpacity } from "react-native";
import TimeSlice, { Mode } from "./ui/TimeSlice";

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

  // Get disabled activities to check if timeslice activities are disabled
  const disabledActivities = useActivitiesStore((s) => s.disabledActivities);
  // Get states from store at top-level to satisfy React Hooks rules
  const states = useStatesStore((s) => s.states);

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
        // Look for activity in both enabled and disabled activities
        const activity =
          activities.find((a: Activity) => a.id === ts.activity_id) ||
          disabledActivities.find((a: Activity) => a.id === ts.activity_id);
        const isEmpty = ts.id == null;
        const uniqueKey = ts.id ?? `${keyPrefix}-${ts.start_time}-${index}`;

        // Determine the icon type based on whether the timeslice is empty, has note_ids or not
        // const iconType = isEmpty
        //   ? undefined // No icon for empty timeslice
        //   : ts.note_ids && ts.note_ids.length > 0
        //     ? "note" // Show note icon if there are notes
        //     : "plus"; // Show plus icon if there are no notes
        const iconType = isEmpty
          ? undefined // No icon for empty timeslice
          : "plus"; // Show plus icon if there are no notes

        // compute state number from the states store if available
        const stateObj = ts.state_id
          ? states?.find((s) => s.id === ts.state_id)
          : undefined;

        // Extract individual mood and energy values
        const energyValue = stateObj?.energy ?? null;
        const moodValue = stateObj?.mood ?? null;

        // Check if the activity is disabled
        const isActivityDisabled =
          !isEmpty && ts.activity_id
            ? disabledActivities.some(
                (disabledActivity) => disabledActivity.id === ts.activity_id
              )
            : false;

        // Build cumulative modes array. Base mode is Today or Past.
        const baseMode = isTodayDisplay ? Mode.Today : Mode.Past;
        const sliceModes: Mode[] = [baseMode];

        // If the activity is disabled, add faded mode.
        if (isActivityDisabled) sliceModes.push(Mode.Faded);

        // If this is the displayed day and the current time is within the
        // timeslice start/end, mark it as Current as well.
        if (isTodayDisplay && ts.start_time && ts.end_time) {
          const startMs = Date.parse(String(ts.start_time));
          const endMs = Date.parse(String(ts.end_time));
          const nowMs = Date.now();
          if (!Number.isNaN(startMs) && !Number.isNaN(endMs)) {
            if (nowMs >= startMs && nowMs < endMs) {
              sliceModes.push(Mode.Current);
            }
          }
        }

        return (
          <TouchableOpacity
            key={uniqueKey}
            onPress={() => onTimeslicePress(ts)}
            onLongPress={() => onTimesliceLongPress(ts)}
          >
            <TimeSlice
              timeslice={ts}
              color={isEmpty ? undefined : (activity?.color ?? "#d9d9d9")}
              iconType={iconType}
              onIconPress={isEmpty ? undefined : () => onIconPress(ts)}
              metadata={{
                note: {
                  noteCount: ts.note_ids ? ts.note_ids.length : 0,
                },
                state: {
                  energy: energyValue ?? undefined,
                  mood: moodValue ?? undefined,
                },
              }}
              modes={sliceModes}
            />
          </TouchableOpacity>
        );
      })}
    </>
  );
};
