import { COLORS } from "@/shared/constants/COLORS";
import React from "react";
import { StyleSheet, View } from "react-native";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps,
}) => {
  return (
    <View style={styles.container}>
      {/* Step indicators */}
      <View style={styles.stepsIndicator}>
        {Array.from({ length: totalSteps }, (_, index) => (
          <View
            key={index}
            style={[
              styles.stepDot,
              index < currentStep
                ? styles.stepDotCompleted
                : styles.stepDotPending,
              index === currentStep - 1 ? styles.stepDotCurrent : null,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  stepsIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    padding: 20,
  },
  stepDot: {
    width: 2,
    height: 8,
    borderRadius: 4,
  },
  stepDotCompleted: {
    backgroundColor: COLORS.primary,
  },
  stepDotCurrent: {
    backgroundColor: COLORS.primary,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stepDotPending: {
    backgroundColor: COLORS.secondary,
  },
});
