import SageIcon from "@/shared/components/icons/SageIcon";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { StatusBar, StyleSheet, Text, View } from "react-native";
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  State,
} from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  FinalOnboardingScreen,
  OnboardingScreenRenderer,
} from "../../features/onboarding/components/screens";
import SideProgressIndicator from "../../features/onboarding/components/ui/SideProgressIndicator";
import { useOnboardingActions } from "../../features/onboarding/hooks/useOnboardingActions";
import { useOnboardingData } from "../../features/onboarding/hooks/useOnboardingData";

export default function OnboardingScreen() {
  const router = useRouter();
  const { currentPage, currentPageData, pages, goToPage, isLastPage } =
    useOnboardingData();
  const { handleComplete } = useOnboardingActions();

  const handleNext = () => {
    if (!isLastPage) {
      goToPage(currentPage + 1);
    }
    // On last page, FinalOnboardingScreen will handle completion and navigation
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      goToPage(currentPage - 1);
    }
  };

  const handleSwipeGesture = (event: PanGestureHandlerGestureEvent) => {
    const { translationX, translationY, velocityX, velocityY, state } =
      event.nativeEvent;

    if (state === State.END) {
      const absTranslationX = Math.abs(translationX);
      const absTranslationY = Math.abs(translationY);

      // Horizontal swipes (primary navigation)
      if (absTranslationX > absTranslationY && absTranslationX > 30) {
        // Swipe left (next page)
        if (translationX < -30 && (velocityX < -300 || absTranslationX > 80)) {
          handleNext();
        }
        // Swipe right (previous page)
        else if (
          translationX > 30 &&
          (velocityX > 300 || absTranslationX > 80)
        ) {
          handlePrevious();
        }
      }
      // Vertical swipes (secondary navigation)
      else if (absTranslationY > 40) {
        // Swipe up (next page)
        if (translationY < -40 && (velocityY < -400 || absTranslationY > 100)) {
          handleNext();
        }
        // Swipe down (previous page)
        else if (
          translationY > 40 &&
          (velocityY > 400 || absTranslationY > 100)
        ) {
          handlePrevious();
        }
      }
    }
  };

  const renderScreen = () => {
    // Handle final animation separately since it has different props
    if (currentPageData.type === "final-animation") {
      return (
        <FinalOnboardingScreen
          onFinish={() => router.replace("/(home)")}
          pushOnboarding={handleComplete}
        />
      );
    }

    return (
      <OnboardingScreenRenderer
        pageData={currentPageData}
        onNext={handleNext}
        onPrevious={handlePrevious}
      />
    );
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#151414" />

      <LinearGradient
        colors={["#4A4747", "#151414"]}
        locations={[0, 0.895]}
        start={{ x: -0.663, y: -0.407 }}
        end={{ x: 0.678, y: 0.841 }}
        style={styles.container}
      >
        <SafeAreaView style={styles.container}>
          <PanGestureHandler onHandlerStateChange={handleSwipeGesture}>
            <View style={styles.container}>
              {/* Pulsating SageIcon - Top Left (hide on final-animation screen) */}
              {currentPageData.type !== "final-animation" && (
                <View style={styles.iconContainer}>
                  <SageIcon status="pulsating" size={80} auto={false} />
                </View>
              )}

              <View style={styles.contentContainer}>
                {/* Main Content */}
                {renderScreen()}
              </View>
              {/* Side Progress Indicator - Right */}
              <SideProgressIndicator
                totalPages={pages.length}
                currentPage={currentPage}
                onPagePress={goToPage}
              />

              {/* CADENCE Text - Bottom Left */}
              <Text style={styles.cadenceText}>CADENCE</Text>
            </View>
          </PanGestureHandler>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  iconContainer: { position: "absolute", top: 40, left: 30 },
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 30,
    marginTop: 120,
    marginBottom: 100,
  },
  cadenceText: {
    position: "absolute",
    bottom: 40,
    left: 30,
    fontSize: 24,
    color: "white",
    fontFamily: "FoundersGrotesk-Regular",
  },
});
