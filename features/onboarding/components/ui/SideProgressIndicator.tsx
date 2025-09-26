import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";

interface SideProgressIndicatorProps {
  totalPages: number;
  currentPage: number;
  onPagePress?: (pageIndex: number) => void;
}

export const SideProgressIndicator: React.FC<SideProgressIndicatorProps> = ({
  totalPages,
  currentPage,
  onPagePress,
}) => {
  const spacing = 8; // Gap between segments in pixels
  const totalSpacing = (totalPages - 1) * spacing;
  const availableHeight = 100; // Using percentage
  const segmentHeight = (availableHeight - (totalSpacing / 4)) / totalPages; // Adjust for spacing

  return (
    <View style={styles.container}>
      {/* Progress line segments */}
      {Array.from({ length: totalPages }).map((_, index) => {
        const isCompleted = index <= currentPage;
        const segmentTop = index * (segmentHeight + spacing / 4);

        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.segmentTouchable,
              {
                top: `${segmentTop}%`,
                height: `${segmentHeight}%`
              }
            ]}
            onPress={() => onPagePress?.(index)}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 15, right: 15 }}
          >
            <View
              style={[
                styles.lineSegment,
                isCompleted ? styles.lineCompleted : styles.lineRemaining
              ]}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 20,
    top: 120,
    bottom: 120,
    width: 3,
    paddingVertical: 20,
  },
  segmentTouchable: {
    position: "absolute",
    width: 3,
    left: 0,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  lineSegment: {
    width: 3,
    height: "100%",
  },
  lineCompleted: {
    backgroundColor: "#FFFFFF",
  },
  lineRemaining: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
});

export default SideProgressIndicator;