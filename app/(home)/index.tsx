import { HIT_SLOP_10 } from "@/shared/constants/hitSlop";
import { SignedIn, SignedOut } from "@clerk/clerk-expo";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import SignIn from "../(auth)/sign-in";

import { ScreenHeader } from "@/shared/components/CadenceUI";
import SageIcon from "@/shared/components/icons/SageIcon";
import { DIALOG_HEIGHT_PLACEHOLDER } from "@/shared/constants/VIEWPORT";
import { useTheme, useViewDialogState } from "@/shared/hooks";
import { useFeatureFlag } from "@/shared/hooks/useFeatureFlags";
import { useDeviceDateTime } from "@/shared/hooks/useDeviceDateTime";
import { generalStyles } from "@/shared/styles";
import { SafeAreaView } from "react-native-safe-area-context";
import LoadingScreen from "../(utils)/LoadingScreen";
const Timeline = React.lazy(() => import("@/features/timeline/Timeline"));

// Provide tiny fallbacks if these shared components don't exist in the repo.
const ErrorBoundary: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => <>{children}</>;

// Stores
import { useI18n } from "@/shared/hooks/useI18n";
import useDialogStore from "@/shared/stores/useDialogStore";

export default function Today() {
  const { t } = useI18n();
  const { getDateTimeSeparator, displayDateTime } = useDeviceDateTime();
  const theme = useTheme();

  // Get dialog state for this view
  const dialogState = useViewDialogState("home");

  // Use feature flag for timeline view toggle
  const isTimelineViewToggleEnabled = useFeatureFlag("timeline-view-toggle");

  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"linear" | "circular">("linear");

  // Derive dialog state from the hook instead of local state
  const isActivityDialogOpen = dialogState.dialogs.some(
    (d) => d.dialogType === "activity-legend"
  );
  const activityDialog = dialogState.dialogs.find(
    (d) => d.dialogType === "activity-legend"
  );
  const isActivityDialogCollapsed = activityDialog?.isCollapsed ?? false;

  // isToday is true if selectedDate is today's date (but ignore time)
  const isToday = selectedDate.toDateString() === new Date().toDateString();
  const title = isToday ? t("home.todayTitle") : t("home.title");

  useEffect(() => {
    setCurrentTime(new Date());
    const interval = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View
      style={[
        generalStyles.flexContainer,
        { backgroundColor: theme.background.primary },
      ]}
    >
      <SignedIn>
        <SafeAreaView style={generalStyles.flexContainer} edges={["top"]}>
          <ScreenHeader
            title={title}
            OnRightElement={() => (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                {isTimelineViewToggleEnabled && (
                  <TouchableOpacity
                    onPress={() =>
                      setViewMode(viewMode === "linear" ? "circular" : "linear")
                    }
                    hitSlop={HIT_SLOP_10}
                  >
                    <Text
                      style={[
                        generalStyles.clickableText,
                        { fontSize: 24, fontWeight: "600" },
                      ]}
                    >
                      {viewMode === "linear" ? "◯" : "—"}
                    </Text>
                  </TouchableOpacity>
                )}
                <SageIcon size={40} status="pulsating" auto={false} />
              </View>
            )}
            subtitle={
              <>
                {/* Tappable date: opens calendar modal */}
                <TouchableOpacity
                  hitSlop={HIT_SLOP_10}
                  onPress={() => {
                    const idHolder: { id?: string } = {};
                    const id = useDialogStore.getState().openDialog({
                      type: "calendar",
                      props: {
                        selectedDate,
                        height: 85,
                        enableDragging: false,
                        headerProps: {
                          title: t("calendarDialog.pick-a-date"),
                        },
                        onSelect: (d: Date) => setSelectedDate(d),
                        onConfirm: () => {
                          if (idHolder.id)
                            useDialogStore.getState().closeDialog(idHolder.id);
                        },
                      },
                    });
                    idHolder.id = id;
                  }}
                >
                  {(() => {
                    const includeTime =
                      selectedDate.toDateString() === new Date().toDateString();
                    const displayed = displayDateTime(
                      (selectedDate.toDateString() === new Date().toDateString()
                        ? currentTime
                        : selectedDate
                      ).toISOString(),
                      {
                        weekdayFormat: "long",
                        weekdayPosition: "before",
                        monthFormat: "long",
                        dateTimeSeparator: getDateTimeSeparator(),
                        includeTime,
                      }
                    );
                    return (
                      <Text style={generalStyles.clickableText}>
                        {displayed}
                      </Text>
                    );
                  })()}
                </TouchableOpacity>
                {/* Back to Today button when a non-today date is selected */}
                {selectedDate.toDateString() !== new Date().toDateString() && (
                  <TouchableOpacity
                    onPress={() => setSelectedDate(new Date())}
                    hitSlop={HIT_SLOP_10}
                  >
                    <View style={style.backToTodayButtonContainer}>
                      <Text style={style.backToTodayButtonText}>{" < "}</Text>
                      <Text style={generalStyles.clickableText}>
                        {t("back-to-today")}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              </>
            }
          />

          <ErrorBoundary>
            {/* Pass selected date into the timeline so it renders the chosen day */}
            <React.Suspense fallback={<LoadingScreen />}>
              <Timeline
                date={selectedDate}
                viewMode={viewMode}
                bottomPadding={
                  isActivityDialogOpen && isActivityDialogCollapsed
                    ? DIALOG_HEIGHT_PLACEHOLDER
                    : 5
                }
              />
            </React.Suspense>
          </ErrorBoundary>

          {/* Share modal could be added here when available */}
        </SafeAreaView>
      </SignedIn>
      <SignedOut>
        <SignIn />
      </SignedOut>
    </View>
  );
}

const style = StyleSheet.create({
  backToTodayButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  backToTodayButtonText: {
    ...generalStyles.clickableText,
    textDecorationLine: "none",
  },
});
