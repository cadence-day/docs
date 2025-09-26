import NoteIcon from "@/shared/components/icons/NoteIcon";
import { COLORS } from "@/shared/constants/COLORS";
import { Timeslice } from "@/shared/types/models";
import { getMoodIcon } from "@/shared/utils/moodUtils";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useRef } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTimesliceDetails } from "../hooks/useTimesliceDetails";
import { reflectionStyles } from "../styles";

type ReflectionCellProps = {
  timeslice?: Timeslice | null;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: object;
  dimmed?: boolean;
  notSelectedOpacity?: number;
  isSelected?: boolean;
};

type EmptyReflectionCellProps = {
  onLongPress?: () => void;
  dimmed?: boolean;
  notSelectedOpacity?: number;
};

export const ReflectionCell = ({
  timeslice,
  onPress,
  onLongPress,
  style,
  dimmed = false,
  notSelectedOpacity = 0.3,
  isSelected = false,
}: ReflectionCellProps) => {
  const hasTimeslice = !!timeslice?.id;
  const { activityColor, energy, mood } = useTimesliceDetails(
    timeslice ?? null
  );

  // Track if long press was triggered to prevent onPress
  const longPressTriggered = useRef(false);

  // Memoize dynamic container style to avoid inline object recreation on each render
  const containerDynamicStyle = useMemo(
    () => ({
      backgroundColor: hasTimeslice
        ? activityColor || COLORS.primary
        : "transparent",
      opacity: dimmed ? notSelectedOpacity : 1,
      borderWidth: isSelected ? 2 : 1,
    }),
    [hasTimeslice, activityColor, dimmed, notSelectedOpacity, isSelected]
  );

  return (
    <TouchableOpacity
      style={[
        reflectionStyles.cell,
        containerDynamicStyle,
        style, // Apply incoming style if passed in
      ]}
      onLongPress={() => {
        if (hasTimeslice && timeslice?.id) {
          longPressTriggered.current = true;
          onLongPress?.();
        }
      }}
      onPress={() => {
        // Prevent onPress if long press was just triggered
        if (longPressTriggered.current) {
          longPressTriggered.current = false;
          return;
        }
        if (hasTimeslice && timeslice?.id) {
          onPress?.();
        }
      }}
      delayLongPress={300}
    >
      {hasTimeslice && (
        <View style={reflectionStyles.cellContent}>
          {/* Note icon on the left if notes exist */}
          {timeslice?.note_ids && timeslice.note_ids.length > 0 && (
            <View style={reflectionStyles.cellLeftIcon}>
              <NoteIcon size="small" color="white" />
            </View>
          )}
          {/* Energy and mood icons on the right */}
          {(energy !== null || mood !== null) && (
            <View style={reflectionStyles.cellRightContent}>
              {/* Energy icon and number */}
              {energy !== null && (
                <View style={reflectionStyles.cellRightItem}>
                  <Ionicons
                    name="flash"
                    size={10}
                    color="rgba(255, 255, 255, 1)"
                  />
                  <Text style={reflectionStyles.cellEnergyText}>{energy}</Text>
                </View>
              )}
              {/* Mood icon */}
              {mood !== null && (
                <View style={reflectionStyles.cellRightItem}>
                  {getMoodIcon(mood, "rgba(255, 255, 255, 1)", { size: 10 })}
                </View>
              )}
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

export const EmptyReflectionCell = ({
  onLongPress,
  dimmed = false,
  notSelectedOpacity = 0.05,
}: EmptyReflectionCellProps) => {
  // Memoize empty cell dynamic style
  const emptyDynamicStyle = useMemo(
    () => ({
      backgroundColor: "transparent",
      opacity: dimmed ? notSelectedOpacity : 1,
    }),
    [dimmed, notSelectedOpacity]
  );

  return (
    <TouchableOpacity
      style={[reflectionStyles.emptyCell, emptyDynamicStyle]}
      onLongPress={() => {
        if (onLongPress) {
          onLongPress();
        }
      }}
    />
  );
};
