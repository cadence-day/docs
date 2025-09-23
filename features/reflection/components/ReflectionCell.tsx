import NoteIcon from "@/shared/components/icons/NoteIcon";
import { COLORS } from "@/shared/constants/COLORS";
import { Timeslice } from "@/shared/types/models";
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
  const { activityColor, energy } = useTimesliceDetails(timeslice ?? null);

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
          {/* Energy icon and number on the right */}
          {energy !== null && (
            <View style={reflectionStyles.cellRightContent}>
              <Ionicons
                name="flash"
                size={8}
                color="rgba(255, 255, 255, 0.9)"
              />
              <Text style={reflectionStyles.cellEnergyText}>{energy}</Text>
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
