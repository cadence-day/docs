import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import {
  Animated,
  PanResponder,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  OnboardingIcon,
  SageIconContainer,
} from "../../features/onboarding/components/ui";
import { useOnboardingActions } from "../../features/onboarding/hooks/useOnboardingActions";
import { useOnboardingData } from "../../features/onboarding/hooks/useOnboardingData";
import { useOnboardingPage } from "../../features/onboarding/hooks/useOnboardingPage";
import useTranslation from "../../shared/hooks/useI18n";
import OnboardingLayout from "./OnboardingLayout";

export default function OnboardingScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { currentPage, pages, goToPage, isLastPage, totalPages } =
    useOnboardingData();
  const { handleNotificationPermission, handlePrivacyPolicy, handleComplete } =
    useOnboardingActions();
  const pan = React.useRef(new Animated.Value(0)).current;

  const currentPageData = useOnboardingPage(
    pages,
    currentPage,
    handleNotificationPermission,
    handlePrivacyPolicy
  );

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages - 1) {
      goToPage(currentPage + 1);
    } else {
      // On last page, complete onboarding and navigate to home
      handleComplete(() => {
        router.replace("/(home)");
      });
    }
  }, [currentPage, totalPages, goToPage, handleComplete, router]);

  const panResponder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to vertical swipes
        return (
          Math.abs(gestureState.dy) > 20 &&
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx)
        );
      },
      onPanResponderMove: Animated.event([null, { dy: pan }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -60) {
          goToNextPage();
        }
        Animated.spring(pan, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  const renderIcon = () => {
    if (currentPageData.iconType === "onboarding") {
      return <OnboardingIcon />;
    }
    if (currentPageData.iconType === "sage") {
      return <SageIconContainer />;
    }
    return null;
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#151414" />
      <LinearGradient
        colors={["#4A4747", "#151414"]}
        locations={[0, 0.895]}
        start={{ x: -0.663, y: -0.407 }}
        end={{ x: 0.678, y: 0.841 }}
        style={styles.gradientContainer}
      >
        <View style={styles.container} {...panResponder.panHandlers}>
          <OnboardingLayout page={currentPage} totalPages={totalPages}>
            {currentPageData.iconType && (
              <View style={styles.iconContainer}>{renderIcon()}</View>
            )}
            <Text style={styles.title}>{currentPageData.title}</Text>
            <Text style={styles.content}>{currentPageData.content}</Text>

            {currentPageData.linkText && (
              <TouchableOpacity
                style={styles.linkButton}
                onPress={currentPageData.linkText.onPress}
              >
                <Text style={styles.linkText}>
                  {currentPageData.linkText.text}
                </Text>
              </TouchableOpacity>
            )}
          </OnboardingLayout>

          {currentPageData.actionButton && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={currentPageData.actionButton.onPress}
            >
              <Text style={styles.actionButtonText}>
                {currentPageData.actionButton.text}
              </Text>
            </TouchableOpacity>
          )}

          {currentPageData.footer && (
            <Text style={styles.footerText}>{currentPageData.footer}</Text>
          )}

          <TouchableOpacity
            style={styles.continueButton}
            onPress={goToNextPage}
          >
            <Text style={styles.continueButtonText}>
              {isLastPage
                ? t("get-started") || "Get Started"
                : t("continue") || "Continue"}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    position: "relative",
  },
  iconContainer: {
    marginBottom: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "left",
    width: "90%",
    fontFamily: "FoundersGrotesk-Bold",
  },
  content: {
    color: "#fff",
    fontSize: 18,
    opacity: 0.85,
    textAlign: "left",
    width: "90%",
    lineHeight: 24,
    fontFamily: "FoundersGrotesk-Regular",
  },
  actionButton: {
    position: "absolute",
    bottom: 120,
    left: 32,
    right: 32,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    fontFamily: "FoundersGrotesk-Medium",
  },
  linkButton: {
    marginTop: 32,
    alignSelf: "flex-start",
  },
  linkText: {
    color: "#FFFFFF",
    fontSize: 16,
    opacity: 0.8,
    textAlign: "left",
    textDecorationLine: "underline",
    fontFamily: "FoundersGrotesk-Regular",
  },
  continueButton: {
    position: "absolute",
    bottom: 60,
    left: 32,
    right: 32,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    fontFamily: "FoundersGrotesk-Medium",
  },
  footerText: {
    position: "absolute",
    bottom: 20,
    left: 32,
    right: 32,
    fontSize: 14,
    color: "#CCCCCC",
    textAlign: "center",
    lineHeight: 20,
    fontFamily: "FoundersGrotesk-Regular",
  },
});
