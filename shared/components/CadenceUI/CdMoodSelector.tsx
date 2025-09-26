import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { COLORS } from "../../constants/COLORS";

const { width: screenWidth } = Dimensions.get("window");

// Responsive scaling functions
const getResponsiveCircleSize = () => {
  if (screenWidth < 350) return 14; // Small phones
  if (screenWidth < 400) return 16; // Medium phones
  if (screenWidth < 500) return 18; // Large phones
  return 20; // Tablets and larger
};

const getResponsiveFontSize = (baseSize: number) => {
  // More conservative scaling to accommodate longer words like "Melancholic"
  if (screenWidth < 350) return Math.max(baseSize * 0.7, 8); // Smaller for very small screens
  if (screenWidth < 400) return Math.max(baseSize * 0.8, 9); // Medium small phones
  const scale = screenWidth / 375; // Base on iPhone X width
  return Math.max(baseSize * Math.min(scale, 1.1), baseSize * 0.9); // Cap at 110% scaling
};

const getResponsivePadding = () => {
  if (screenWidth < 350) return 16; // Small phones
  if (screenWidth < 400) return 24; // Medium phones
  if (screenWidth < 500) return 32; // Large phones
  return 40; // Tablets and larger
};

interface CdMoodSelectorProps {
  label?: string;
  value: number; // 0-5 (0 = no selection, 1-5 = mood levels)
  onChange?: (val: number) => void;
  style?: ViewStyle;
}

const CIRCLE_COUNT = 5;
const ACTIVE_COLOR = COLORS.primary;

// Mood labels for each level (1-5)
const MOOD_LABELS = ["Sad", "Melancholic", "Neutral", "Content", "Happy"];

export const CdMoodSelector: React.FC<CdMoodSelectorProps> = ({
  label = "MOOD",
  value,
  onChange,
  style,
}) => {
  // Dynamic styles based on screen size
  const circleSize = getResponsiveCircleSize();
  const dynamicStyles = {
    circle: {
      width: circleSize,
      height: circleSize,
      borderRadius: circleSize / 2,
    },
    circleRow: {
      paddingHorizontal: getResponsivePadding(),
    },
    labelText: {
      fontSize: getResponsiveFontSize(10),
    },
    circleLabel: {
      fontSize: getResponsiveFontSize(10),
    },
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.labelContainer}>
        <Text style={[styles.labelText, dynamicStyles.labelText]}>{label}</Text>
      </View>

      <View style={styles.indicatorSection}>
        {/* Circles distributed across full width */}
        <View style={[styles.circleRow, dynamicStyles.circleRow]}>
          {Array.from({ length: CIRCLE_COUNT }).map((_, i) => (
            <React.Fragment key={i}>
              {onChange ? (
                <TouchableOpacity
                  onPress={() => onChange(i + 1)}
                  onLongPress={() => onChange(0)} // Reset to 0 on long press
                  activeOpacity={0.7}
                  style={[styles.circleTouchable, { borderRadius: circleSize }]}
                >
                  <View
                    style={[
                      styles.circle,
                      dynamicStyles.circle,
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
                    dynamicStyles.circle,
                    {
                      backgroundColor: i < value ? ACTIVE_COLOR : "#222",
                    },
                  ]}
                />
              )}
            </React.Fragment>
          ))}
        </View>

        {/* Labels positioned to align with circles */}
        <View style={styles.labelRow}>
          {MOOD_LABELS.map((label, i) => (
            <Text
              key={i}
              style={[styles.circleLabel, dynamicStyles.circleLabel]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {label}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  labelText: {
    color: "#bbb",
    fontWeight: "400",
    letterSpacing: 2,
    marginBottom: 16,
    flexShrink: 0, // Prevent label from shrinking
    textTransform: "uppercase",
  },
  indicatorSection: {
    width: "100%",
    flexDirection: "column",
  },
  circleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Distribute circles across full width
    width: "100%",
    marginBottom: 4,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between", // Align labels with circles
    width: "100%",
    marginTop: 4,
  },
  labelContainer: {
    alignItems: "center",
  },
  circleTouchable: {
    // borderRadius will be set dynamically
  },
  circle: {
    // width, height, and borderRadius will be set dynamically
  },
  circleLabel: {
    fontWeight: "400",
    letterSpacing: 0.5, // Reduced letter spacing to give more room for text
    textAlign: "center",
    color: "#bbb",
    flex: 1, // Allow labels to distribute evenly
    paddingHorizontal: 2, // Small padding to prevent text touching edges
  },
});
