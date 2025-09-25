import React from "react";
import { Dimensions, SafeAreaView, StyleSheet, Text, View } from "react-native";
import SageIcon from "../../shared/components/icons/SageIcon";

const { height } = Dimensions.get("window");

interface OnboardingLayoutProps {
  children: React.ReactNode;
  page: number;
  totalPages: number;
}

export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  page,
  totalPages,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Background gradient and rounded corners can be handled by parent or here if needed */}
      <View
        style={styles.sageIconContainer}
        accessibilityLabel="Sage Icon"
        testID="onboarding-sage-icon"
      >
        <SageIcon size={40} status="still" />
      </View>
      <View style={styles.textContainer}>{children}</View>
      <View style={styles.pageIndicatorContainer}>
        {Array.from({ length: totalPages }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.pageDot,
              i === page ? styles.pageDotActive : undefined,
            ]}
          />
        ))}
      </View>
      <View style={styles.cadenceContainer}>
        <Text
          style={styles.cadenceText}
          accessibilityLabel="CADENCE branding"
          testID="onboarding-cadence-branding"
        >
          CADENCE
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent", // Let parent gradient show through
    position: "relative",
  },
  sageIconContainer: {
    position: "absolute",
    top: 64, // Account for status bar
    left: 32,
    zIndex: 2,
  },
  textContainer: {
    position: "absolute",
    top: height * 0.2, // Move down a bit to account for full screen
    left: 32,
    right: 100,
    minHeight: height * 0.35,
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  pageIndicatorContainer: {
    position: "absolute",
    top: height * 0.2,
    right: 32,
    width: 20,
    height: height * 0.6,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 20,
  },
  pageDot: {
    width: 4,
    height: 40,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginVertical: 8,
  },
  pageDotActive: {
    backgroundColor: "#fff",
    width: 6,
    height: 50,
    borderRadius: 3,
  },
  cadenceContainer: {
    position: "absolute",
    left: 32,
    bottom: 160, // Leave space for buttons
  },
  cadenceText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 1.5,
    fontFamily: "FoundersGrotesk-Bold",
  },
});

export default OnboardingLayout;
