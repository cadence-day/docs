import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

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
const ACTIVE_COLOR = "#7B61FF";
const LINE_COLOR = "#444";

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
      <Text style={styles.label}>{label}</Text>

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
    flexDirection: "row",
    alignItems: "flex-start",
  },
  label: {
    color: "#bbb",
    fontSize: 10,
    fontWeight: "400",
    letterSpacing: 2,
    width: 60, // Fixed width for label
    marginRight: 18,
    flexShrink: 0, // Prevent label from shrinking
    textTransform: "uppercase",
  },
  indicatorSection: {
    flex: 1,
    flexDirection: "column",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start", // Align circles to the start
  },
  labelRow: {
    flexDirection: "row",
    marginTop: 6,
  },
  labelContainer: {
    alignItems: "center",
  },
  labelSpacer: {
    flex: 1, // Same flex as line to maintain spacing
    marginHorizontal: 6,
  },
  circleTouchable: {
    borderRadius: 999,
  },
  circle: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  line: {
    flex: 1, // Dynamic width to fill available space
    height: 2,
    backgroundColor: LINE_COLOR,
    marginHorizontal: 6,
    opacity: 0.4,
  },
  endLabel: {
    fontSize: 10,
    fontWeight: "400",
    letterSpacing: 1,
    textAlign: "center",
    flexShrink: 0, // Prevent text from shrinking
    color: "#fff",
  },
});
