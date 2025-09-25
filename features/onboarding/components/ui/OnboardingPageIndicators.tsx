import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface OnboardingPageIndicatorsProps {
  totalPages: number;
  currentPage: number;
  onPagePress: (pageIndex: number) => void;
}

const OnboardingPageIndicators: React.FC<OnboardingPageIndicatorsProps> = ({
  totalPages,
  currentPage,
  onPagePress,
}) => {
  return (
    <View style={styles.pageIndicatorContainer}>
      {Array.from({ length: totalPages }).map((_, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.pageIndicator,
            currentPage === index && styles.pageIndicatorActive,
          ]}
          onPress={() => onPagePress(index)}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.pageIndicatorDot,
              currentPage === index && styles.pageIndicatorActiveDot,
            ]}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  pageIndicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    paddingVertical: 10,
  },
  pageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginHorizontal: 6,
    minWidth: 44, // Ensures proper touch target size
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  pageIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  pageIndicatorActive: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  pageIndicatorActiveDot: {
    backgroundColor: "#FFFFFF",
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

export default OnboardingPageIndicators;
