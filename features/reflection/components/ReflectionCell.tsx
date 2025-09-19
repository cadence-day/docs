import NoteIcon from "@/shared/components/icons/NoteIcon";
import { COLORS } from "@/shared/constants/COLORS";
import { Timeslice } from "@/shared/types/models";
import { Ionicons } from "@expo/vector-icons";
import React, { useRef } from "react";
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
}: ReflectionCellProps) => {
  const hasTimeslice = !!timeslice?.id;
  const { activityColor, energy, isLoading, error } = useTimesliceDetails(
    timeslice ?? null
  );

  // Check if timeslice has notes
  const hasNotes = timeslice?.note_ids && timeslice.note_ids.length > 0;

  // Track if long press was triggered to prevent onPress
  const longPressTriggered = useRef(false);

  return (
    <TouchableOpacity
      style={[
        reflectionStyles.cell,
        {
          backgroundColor: hasTimeslice
            ? activityColor || COLORS.primary
            : "transparent",
          opacity: dimmed ? notSelectedOpacity : 1,
        },
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
  return (
    <TouchableOpacity
      style={[
        reflectionStyles.emptyCell,
        {
          backgroundColor: "transparent",
          opacity: dimmed ? notSelectedOpacity : 1,
        },
      ]}
      onLongPress={() => {
        if (onLongPress) {
          onLongPress();
        }
      }}
    />
  );
};
