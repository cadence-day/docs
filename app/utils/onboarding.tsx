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
import {
  ActivitySelectionScreen,
  WelcomeScreen,
} from "../../features/onboarding/components/screens";
import {
  GridImage,
  NoteImage,
  TimelineImage,
} from "../../features/onboarding/components/ui";
import SideProgressIndicator from "../../features/onboarding/components/ui/SideProgressIndicator";
import { useOnboardingActions } from "../../features/onboarding/hooks/useOnboardingActions";
import { useOnboardingData } from "../../features/onboarding/hooks/useOnboardingData";
import { useOnboardingPage } from "../../features/onboarding/hooks/useOnboardingPage";
import { CdButton } from "../../shared/components/CadenceUI";

export default function OnboardingScreen() {
  const router = useRouter();
  const { currentPage, pages, goToPage, isLastPage } = useOnboardingData();
  const {
    handleNotificationPermission,
    handlePrivacyPolicy,
    handleComplete,
    setSelectedActivities,
  } = useOnboardingActions();

  const currentPageData = useOnboardingPage(
    pages,
    currentPage,
    handleNotificationPermission,
    handlePrivacyPolicy
  );

  // Wire ActivitySelectionScreen's onActivitiesChange to setSelectedActivities from actions hook
  const handleActivitiesChange = (activities: string[]) => {
    setSelectedActivities(activities);
  };

  const handleNext = () => {
    if (!isLastPage) {
      goToPage(currentPage + 1);
    } else {
      // On last page, complete onboarding and navigate to home
      handleComplete(() => {
        router.replace("/(home)");
      });
    }
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
    switch (currentPageData.type) {
      case "welcome":
        return <WelcomeScreen pageData={currentPageData} />;

      case "activity-selection":
        return (
          <ActivitySelectionScreen
            pageData={currentPageData}
            onActivitiesChange={handleActivitiesChange}
          />
        );

      case "notifications":
        return (
          <View style={styles.screenContainer}>
            <View style={styles.contentContainer}>
              <Text style={styles.title}>{currentPageData.title}</Text>
              <Text style={styles.content}>{currentPageData.content}</Text>

              <View style={styles.notificationSchedule}>
                {currentPageData.notificationSchedule?.map((item, index) => (
                  <View key={index} style={styles.notificationItem}>
                    <Text style={styles.notificationLabel}>{item.label}</Text>
                    <Text style={styles.notificationTime}>{item.time}</Text>
                  </View>
                ))}
              </View>

              <CdButton
                title="Allow notifications"
                onPress={handleNext}
                variant="outline"
                style={styles.actionButton}
              />
            </View>
          </View>
        );

      // Fallback for other screen types - use simple layout
      default:
        return (
          <View style={styles.screenContainer}>
            <View style={styles.contentContainer}>
              <Text style={styles.title}>{currentPageData.title}</Text>
              <Text style={styles.content}>{currentPageData.content}</Text>

              {/* Add PNG images for specific screen types */}
              {currentPageData.type === "time-logging" && (
                <View style={styles.imageContainer}>
                  <TimelineImage />
                </View>
              )}

              {currentPageData.type === "pattern-view" && (
                <View style={styles.imageContainer}>
                  <GridImage />
                </View>
              )}

              {currentPageData.type === "note-taking" && (
                <View style={styles.imageContainer}>
                  <NoteImage />
                </View>
              )}

              {currentPageData.footer && (
                <Text style={styles.footerText}>{currentPageData.footer}</Text>
              )}
            </View>
          </View>
        );
    }
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
        <PanGestureHandler onHandlerStateChange={handleSwipeGesture}>
          <View style={styles.container}>
            {/* Pulsating SageIcon - Top Left */}
            <View style={{ position: "absolute", top: 40, left: 30 }}>
              <SageIcon status="pulsating" size={80} auto={false} />
            </View>

            {/* Main Content */}
            {renderScreen()}

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
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    marginTop: 20,
    alignItems: "center",
    flex: 1,
    width: "100%",
    padding: 20,
    position: "relative",
  },
  screenContainer: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    padding: 20,
    paddingTop: 40,
    paddingBottom: 60,
    paddingLeft: 20,
  },
  contentContainer: {
    flex: 1,
    width: 300,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    marginTop: 120,
  },
  title: {
    fontSize: 18,
    color: "white",
    textAlign: "left",
    marginBottom: 16,
  },
  content: {
    fontSize: 16,
    color: "white",
    textAlign: "left",
    lineHeight: 20,
    opacity: 0.9,
  },
  footerText: {
    fontSize: 14,
    color: "#CCCCCC",
    textAlign: "left",
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 0,
    lineHeight: 20,
  },
  cadenceText: {
    position: "absolute",
    bottom: 40,
    left: 30,
    fontSize: 24,
    color: "white",
    fontFamily: "FoundersGrotesk-Regular",
  },
  notificationSchedule: {
    marginTop: 24,
    marginBottom: 32,
    width: "100%",
  },
  notificationItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  notificationLabel: {
    fontSize: 16,
    color: "white",
    opacity: 0.9,
  },
  notificationTime: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },
  actionButton: {
    marginTop: 20,
    alignSelf: "center",
    width: "100%",
  },
  imageContainer: {
    width: "100%",
    alignItems: "flex-start",
  },
});
