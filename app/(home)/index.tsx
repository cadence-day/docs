import { HIT_SLOP_10 } from "@/shared/constants/hitSlop";
import { SignedIn, SignedOut } from "@clerk/clerk-expo";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import SignIn from "../(auth)/sign-in";

import { CdButton, ScreenHeader } from "@/shared/components/CadenceUI";
import SageIcon from "@/shared/components/icons/SageIcon";
import { DIALOG_HEIGHT_PLACEHOLDER } from "@/shared/constants/VIEWPORT";
import { useTheme } from "@/shared/hooks";
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

  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);
  // isToday is true if selectedDate is today's date (but ignore time)
  const isToday = selectedDate.toDateString() === new Date().toDateString();
  const title = isToday ? t("home.todayTitle") : t("home.title");

  useEffect(() => {
    setCurrentTime(new Date());
    const interval = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  // Listen to dialog store changes to track activity dialog state
  useEffect(() => {
    const unsubscribe = useDialogStore.subscribe((state) => {
      const hasActivityDialog = Object.values(state.dialogs).some(
        (dialog) => dialog.type === "activity-legend"
      );
      setIsActivityDialogOpen(hasActivityDialog);
    });

    return unsubscribe;
  }, []);

  // Function to reopen activity dialog
  const reopenActivityDialog = () => {
    useDialogStore.getState().openDialog({
      type: "activity-legend",
      props: {
        preventClose: true,
        enableSwipeOnAllAreas: true, // Allow swipe to resize on all areas
      },
      position: "dock",
    });
  };

  return (
    <View
      style={[
        generalStyles.flexContainer,
        { backgroundColor: theme.background.primary },
      ]}
    >
      <SignedIn>
        <SafeAreaView style={generalStyles.flexContainer}>
          <ScreenHeader
            title={title}
            OnRightElement={() => (
              <SageIcon size={40} status="pulsating" auto={false} />
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
                        height: 60,
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
              <Timeline date={selectedDate} />
            </React.Suspense>
          </ErrorBoundary>

          {/* Spacer to ensure there's room below the timeline (e.g., above nav) */}
          <View style={style.emptySpaceBelowTimeline}>
            {/* Reopen Activity Dialog Button - shown when dialog is closed */}
            {!isActivityDialogOpen && (
              <CdButton
                title={t("activity.legend.reopen")}
                onPress={reopenActivityDialog}
                variant="outline"
                size="medium"
                style={generalStyles.outlineDiscreetButton}
                textStyle={generalStyles.discreetText}
              />
            )}
          </View>

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
  // TODO: Remove this below an make it conditional.
  emptySpaceBelowTimeline: {
    height: DIALOG_HEIGHT_PLACEHOLDER,
    justifyContent: "center",
    alignItems: "center",
  },
});
