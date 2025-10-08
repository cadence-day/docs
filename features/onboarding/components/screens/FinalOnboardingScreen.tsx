import SageIcon from "@/shared/components/icons/SageIcon";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet } from "react-native";

const { width } = Dimensions.get("window");

interface FinalOnboardingScreenProps {
  onFinish: () => void;
  pushOnboarding: () => Promise<void>;
}

export const FinalOnboardingScreen: React.FC<FinalOnboardingScreenProps> = ({
  onFinish,
  pushOnboarding,
}) => {
  // Centered logo, only animate scale and fade
  const iconSize = width * 0.6;
  const iconScale = useRef(new Animated.Value(1)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      // 0. Pause for a moment
      Animated.delay(1000),
      // 1. Grow in place (centered)
      Animated.timing(iconScale, {
        toValue: 0, // much larger scale for dramatic effect
        duration: 900,
        useNativeDriver: true,
      }),
      // 2. Fade out everything
      Animated.timing(fadeOut, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(async () => {
      await pushOnboarding();
      onFinish();
    });
  }, [iconScale, fadeOut, pushOnboarding, onFinish]);

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeOut },
        { transform: [{ scale: iconScale }] },
      ]}
    >
      <SageIcon size={iconSize} status="pulsating" auto={false} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
