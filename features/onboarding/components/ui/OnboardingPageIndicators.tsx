import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";

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
        <TouchableOpacity key={index} onPress={() => onPagePress(index)}>
          <View
            style={[
              styles.pageIndicator,
              currentPage === index && styles.pageIndicatorActive,
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
  },
  pageIndicator: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#727272",
    marginHorizontal: 4,
  },
  pageIndicatorActive: {
    backgroundColor: "#FFFFFF",
  },
});

export default OnboardingPageIndicators;