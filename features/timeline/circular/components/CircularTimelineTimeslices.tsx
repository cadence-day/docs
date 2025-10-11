import useActivitiesStore from "@/shared/stores/resources/useActivitiesStore";
import useStatesStore from "@/shared/stores/resources/useStatesStore";
import { Activity, Timeslice } from "@/shared/types/models";
import React from "react";
import Svg, { Circle, G, Text as SvgText } from "react-native-svg";
import RadialTimeSlice, { RadialMode } from "./RadialTimeSlice";
import { COLORS } from "@/shared/constants/COLORS";

interface CircularTimelineTimeslicesProps {
  timeslices: Timeslice[];
  activities: Activity[];
  onTimeslicePress: (timeslice: Timeslice) => void;
  onTimesliceLongPress: (timeslice: Timeslice) => void;
  dateForDisplay?: Date;
  size: number;
  radius: number;
  innerRadius: number;
  clockRadius: number;
}

/**
 * Component to render circular timeslices with hour indicators
 */
export const CircularTimelineTimeslices: React.FC<
  CircularTimelineTimeslicesProps
> = ({
  timeslices,
  activities,
  onTimeslicePress,
  onTimesliceLongPress,
  dateForDisplay,
  size,
  radius,
  innerRadius,
  clockRadius,
}) => {
  const centerX = size / 2;
  const centerY = size / 2;

  const displayDate = dateForDisplay ? new Date(dateForDisplay) : new Date();
  const startOfDisplayDay = new Date(displayDate);
  startOfDisplayDay.setHours(0, 0, 0, 0);
  const isTodayDisplay =
    startOfDisplayDay.toDateString() === new Date().toDateString();

  const disabledActivities = useActivitiesStore((s) => s.disabledActivities);

  const visibleTimeslices = timeslices.filter((ts) => {
    if (!ts.start_time) return true;
    const parsed =
      typeof ts.start_time === "number"
        ? ts.start_time
        : Date.parse(String(ts.start_time));
    if (Number.isNaN(parsed)) return true;
    return Number(parsed) >= startOfDisplayDay.getTime();
  });

  // Calculate angle for each timeslice (48 segments = 7.5 degrees each)
  const anglePerSegment = 360 / 48;

  return (
    <Svg width={size} height={size}>
      {/* Render timeslice arcs */}
      {visibleTimeslices.map((ts, index) => {
        const activity =
          activities.find((a: Activity) => a.id === ts.activity_id) ||
          disabledActivities.find((a: Activity) => a.id === ts.activity_id);

        const isEmpty = ts.id == null;
        const startAngle = index * anglePerSegment;
        const endAngle = startAngle + anglePerSegment;

        // Determine if this is the current timeslice
        let isCurrent = false;
        if (isTodayDisplay && ts.start_time && ts.end_time) {
          const startMs = Date.parse(String(ts.start_time));
          const endMs = Date.parse(String(ts.end_time));
          const nowMs = Date.now();
          if (!Number.isNaN(startMs) && !Number.isNaN(endMs)) {
            isCurrent = nowMs >= startMs && nowMs < endMs;
          }
        }

        // Check if activity is disabled
        const isActivityDisabled =
          !isEmpty && ts.activity_id
            ? disabledActivities.some(
                (disabledActivity) => disabledActivity.id === ts.activity_id
              )
            : false;

        // Build modes array
        const baseMode = isTodayDisplay ? RadialMode.Today : RadialMode.Past;
        const sliceModes: RadialMode[] = [baseMode];

        if (isActivityDisabled) sliceModes.push(RadialMode.Faded);
        if (isCurrent) sliceModes.push(RadialMode.Current);

        return (
          <RadialTimeSlice
            key={ts.id ?? `timeslice-${index}`}
            timeslice={ts}
            color={isEmpty ? undefined : (activity?.color ?? "#d9d9d9")}
            onPress={() => onTimeslicePress(ts)}
            onLongPress={() => onTimesliceLongPress(ts)}
            modes={sliceModes}
            startAngle={startAngle}
            endAngle={endAngle}
            outerRadius={radius}
            innerRadius={innerRadius}
            centerX={centerX}
            centerY={centerY}
          />
        );
      })}

      {/* Clock background circle */}
      <Circle
        cx={centerX}
        cy={centerY}
        r={clockRadius}
        fill={COLORS.neutral.white}
        opacity={0.98}
        stroke={COLORS.brand.primary}
        strokeWidth={2}
      />

      {/* Time indicators (hour labels around clock) */}
      {[0, 3, 6, 9, 12, 15, 18, 21].map((hour) => {
        const angle = ((hour * 360) / 24 - 90) * (Math.PI / 180);
        const indicatorRadius = clockRadius - 15;
        const x = centerX + indicatorRadius * Math.cos(angle);
        const y = centerY + indicatorRadius * Math.sin(angle);
        const displayHour =
          hour === 0 ? "00" : hour.toString().padStart(2, "0");

        return (
          <G key={`hour-${hour}`}>
            <SvgText
              x={x}
              y={y + 4}
              fontSize="12"
              fill={COLORS.light.text.secondary}
              textAnchor="middle"
              opacity={0.6}
            >
              {displayHour}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
};
