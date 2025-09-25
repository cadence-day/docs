import SageIcon from "@/shared/components/icons/SageIcon";
import useTranslation from "@/shared/hooks/useI18n";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet } from "react-native";

const { height, width } = Dimensions.get("window");

interface FinalOnboardingScreenProps {
  onFinish: () => void;
  pushOnboarding: () => Promise<void>;
}

export const FinalOnboardingScreen: React.FC<FinalOnboardingScreenProps> = ({
  onFinish,
  pushOnboarding,
}) => {
  // Start at absolute top-left (30,30)
  const { t } = useTranslation();
  const iconX = useRef(new Animated.Value(30)).current;
  const iconY = useRef(new Animated.Value(30)).current;
  const iconScale = useRef(new Animated.Value(1)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;

  // Center target
  const centerX = width / 2 - (width * 0.6) / 2;
  const centerY = height / 2 - (width * 0.6) / 2;

  useEffect(() => {
    Animated.sequence([
      // 1. Grow in place at top-left
      Animated.timing(iconScale, {
        toValue: 1.25,
        duration: 700,
        useNativeDriver: true,
      }),
      // 2. Show text
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.delay(500),
      // 3. Move diagonally to center while shrinking
      Animated.parallel([
        Animated.timing(iconX, {
          toValue: centerX,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(iconY, {
          toValue: centerY,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(iconScale, {
          toValue: 0.7,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(400),
      // 4. Fade out everything
      Animated.timing(fadeOut, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start(async () => {
      await pushOnboarding();
      onFinish();
    });
    // eslint-disable-next-line
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeOut }]}>
      <Animated.View
        style={[
          styles.iconContainer,
          {
            transform: [
              { translateX: iconX },
              { translateY: iconY },
              { scale: iconScale },
            ],
          },
        ]}
      >
        <SageIcon size={width * 0.6} status="pulsating" auto={false} />
      </Animated.View>
      <Animated.Text style={[styles.text, { opacity: textOpacity }]}>
        {t("tuning-cadence-at-your-rhythm")}
      </Animated.Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#181A20",
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    position: "absolute",
    // left/top handled by animation
  },
  text: {
    position: "absolute",
    bottom: height * 0.18,
    width: "100%",
    textAlign: "center",
    color: "#fff",
    fontSize: 24,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
