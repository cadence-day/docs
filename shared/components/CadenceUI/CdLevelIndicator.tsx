import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { COLORS } from "../../constants/COLORS";
import { CONTAINER } from "../../constants/CONTAINER";
import { TYPOGRAPHY } from "../../constants/TYPOGRAPHY";

interface CdLevelIndicatorProps {
  label: string;
  value: number; // 1-5
  onChange?: (val: number) => void;
  style?: ViewStyle;
  count?: number;
  props?: {
    lowLabel?: string;
    highLabel?: string;
  };
}

const CIRCLE_COUNT = 5;
const ACTIVE_COLOR = COLORS.primary;
const LINE_COLOR = COLORS.separatorline.light;

export const CdLevelIndicator: React.FC<CdLevelIndicatorProps> = ({
  label,
  value,
  count = CIRCLE_COUNT,
  onChange,
  style,
  props = {},
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.labelText}>{label}</Text>

      <View style={styles.indicatorSection}>
        {/* First row: Circles and lines */}
        <View style={styles.row}>
          {Array.from({ length: count }).map((_, i) => (
            <React.Fragment key={i}>
              {onChange ? (
                <TouchableOpacity
                  onPress={() => onChange(i + 1)}
                  onLongPress={() => onChange(0)} // Reset to 0 on long press
                  activeOpacity={0.7}
                  style={styles.circleTouchable}
                >
                  <View
                    style={[
                      styles.circle,
                      {
                        backgroundColor: i < value ? ACTIVE_COLOR : "#444",
                      },
                    ]}
                  />
                </TouchableOpacity>
              ) : (
                <View
                  style={[
                    styles.circle,
                    {
                      backgroundColor: i < value ? ACTIVE_COLOR : "#222",
                    },
                  ]}
                />
              )}
              {i < count - 1 && <View style={styles.line} />}
            </React.Fragment>
          ))}
        </View>

        {/* Second row: Labels aligned below first and last circles */}
        {(props.lowLabel || props.highLabel) && (
          <View style={styles.labelRow}>
            {Array.from({ length: count }).map((_, i) => (
              <React.Fragment key={`label-${i}`}>
                <View style={styles.labelContainer}>
                  {i === 0 && props.lowLabel && (
                    <Text style={styles.endLabel}>{props.lowLabel}</Text>
                  )}
                  {i === count - 1 && props.highLabel && (
                    <Text style={styles.endLabel}>{props.highLabel}</Text>
                  )}
                </View>
                {i < count - 1 && <View style={styles.labelSpacer} />}
              </React.Fragment>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...CONTAINER.layout.direction.row,
    ...CONTAINER.layout.align.start,
  },
  labelText: {
    color: COLORS.light.text.tertiary,
    ...TYPOGRAPHY.specialized.metadata,
    letterSpacing: TYPOGRAPHY.letterSpacing.wider,
    width: 60, // Fixed width for label
    ...CONTAINER.margin.right.lg,
    flexShrink: 0, // Prevent label from shrinking
    textTransform: "uppercase",
  },
  indicatorSection: {
    ...CONTAINER.layout.flex.grow,
    ...CONTAINER.layout.direction.column,
  },
  row: {
    ...CONTAINER.layout.direction.row,
    ...CONTAINER.layout.align.center,
    ...CONTAINER.layout.justify.start, // Align circles to the start
  },
  labelRow: {
    ...CONTAINER.layout.direction.row,
    ...CONTAINER.margin.top.sm,
  },
  labelContainer: {
    ...CONTAINER.layout.align.center,
  },
  labelSpacer: {
    ...CONTAINER.layout.flex.grow, // Same flex as line to maintain spacing
    marginHorizontal: CONTAINER.spacing.sm,
  },
  circleTouchable: {
    ...CONTAINER.border.radius.full,
  },
  circle: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  line: {
    ...CONTAINER.layout.flex.grow, // Dynamic width to fill available space
    height: 2,
    backgroundColor: LINE_COLOR,
    marginHorizontal: CONTAINER.spacing.sm,
    ...CONTAINER.opacity.high,
  },
  endLabel: {
    ...TYPOGRAPHY.specialized.metadata,
    letterSpacing: TYPOGRAPHY.letterSpacing.normal,
    textAlign: "center",
    flexShrink: 0, // Prevent text from shrinking
    color: COLORS.neutral.white,
  },
});
