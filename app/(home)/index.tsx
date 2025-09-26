import { HIT_SLOP_10 } from "@/shared/constants/hitSlop";
import { SignedIn, SignedOut } from "@clerk/clerk-expo";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { CdButton, ScreenHeader } from "@/shared/components/CadenceUI";
import SageIcon from "@/shared/components/icons/SageIcon";
import { backgroundLinearColors } from "@/shared/constants/COLORS";
import { DIALOG_HEIGHT_PLACEHOLDER } from "@/shared/constants/VIEWPORT";
import { useDeviceDateTime } from "@/shared/hooks/useDeviceDateTime";
import SignIn from "../(auth)/sign-in";
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
      },
      position: "dock",
    });
  };

  return (
    <View style={style.container}>
      <SignedIn>
        <LinearGradient
          colors={[
            backgroundLinearColors.primary.end,
            backgroundLinearColors.primary.end,
          ]}
          style={style.container}
        >
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
                    return <Text style={style.header}>{displayed}</Text>;
                  })()}
                </TouchableOpacity>
                {/* Back to Today button when a non-today date is selected */}
                {selectedDate.toDateString() !== new Date().toDateString() && (
                  <TouchableOpacity
                    onPress={() => setSelectedDate(new Date())}
                    style={style.backToTodayButton}
                  >
                    <View style={style.backToTodayButtonContainer}>
                      <Text style={style.backToTodayButtonText}>{" < "}</Text>
                      <Text style={style.backToTodayButtonTextRight}>
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
                style={style.openActivityDialogButton}
                textStyle={style.openActivityDialogButtonText}
              />
            )}
          </View>

          {/* Share modal could be added here when available */}
        </LinearGradient>
      </SignedIn>
      <SignedOut>
        <SignIn />
      </SignedOut>
    </View>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    fontSize: 14,
    color: "#444",
    textDecorationLine: "underline",
  },
  backToTodayButton: {
    marginLeft: 12,
  },
  backToTodayButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  backToTodayButtonText: {
    textTransform: "uppercase",
    color: "#444",
    fontSize: 12,
    letterSpacing: 0.5,
  },
  backToTodayButtonTextRight: {
    textDecorationLine: "underline",
    textTransform: "uppercase",
    color: "#444",
    fontSize: 12,
    letterSpacing: 0.5,
  },
  emptySpaceBelowTimeline: {
    height: DIALOG_HEIGHT_PLACEHOLDER,
    justifyContent: "center",
    alignItems: "center",
  },
  openActivityDialogButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  openActivityDialogButtonText: {
    color: "#333",
  },
});
