import { SignedIn, SignedOut } from "@clerk/clerk-expo";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useSegments } from "expo-router";
import React, { useEffect, useState } from "react";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";

import Timeline from "@/features/timeline/Timeline";
import { CdButton } from "@/shared/components/CadenceUI";
import SageIcon from "@/shared/components/icons/SageIcon";
import { backgroundLinearColors } from "@/shared/constants/COLORS";
import { DIALOG_HEIGHT_PLACEHOLDER } from "@/shared/constants/VIEWPORT";
import { useDateTimePreferences } from "@/shared/hooks/useDateTimePreferences";
import {
  formatDateWithWeekday,
  formatTimeForDisplay,
} from "@/shared/utils/datetime";
import SignIn from "../(auth)/sign-in";
// activityLegend hook isn't present in this path in the repo; use a simple local
// fallback. If you have a specific hook, we can wire it later.
const useActivityLegend = () => ({ isVisible: false, hide: () => {} });
// Provide tiny fallbacks if these shared components don't exist in the repo.
const ErrorBoundary: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => <>{children}</>;
const LoadingScreen: React.FC = () => <></>;

// Stores

import { useToast } from "@/shared/hooks";
import { useI18n } from "@/shared/hooks/useI18n";
import useActivityCategoriesStore from "@/shared/stores/resources/useActivityCategoriesStore";
import useDialogStore from "@/shared/stores/useDialogStore";

export default function Today() {
  const { t } = useI18n();
  const router = useRouter();
  const dateTimePreferences = useDateTimePreferences();
  const activityLegend = useActivityLegend();

  const activityCategories = useActivityCategoriesStore(
    (state) => state.categories
  );

  const { showInfo } = useToast();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);
  const segments = useSegments();

  useEffect(() => {
    setCurrentTime(new Date());
    const interval = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  // Open activity dialog by default as persistent
  useEffect(() => {
    const openActivityLegend = () => {
      const id = useDialogStore.getState().openDialog({
        type: "activity",
        props: {
          mode: "legend",
          preventClose: true, // Make it persistent
        },
        position: "dock",
      });
      setIsActivityDialogOpen(true);
    };

    // Small delay to ensure stores are ready
    const timer = setTimeout(openActivityLegend, 100);
    return () => clearTimeout(timer);
  }, []);

  // Listen to dialog store changes to track activity dialog state
  useEffect(() => {
    const unsubscribe = useDialogStore.subscribe((state) => {
      const hasActivityDialog = Object.values(state.dialogs).some(
        (dialog) => dialog.type === "activity"
      );
      setIsActivityDialogOpen(hasActivityDialog);
    });

    return unsubscribe;
  }, []);

  // Function to reopen activity dialog
  const reopenActivityDialog = () => {
    useDialogStore.getState().openDialog({
      type: "activity",
      props: {
        mode: "legend",
        preventClose: true,
      },
      position: "dock",
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <SignedIn>
        <LinearGradient
          colors={[
            backgroundLinearColors.primary.end,
            backgroundLinearColors.primary.end,
          ]}
          style={{ flex: 1 }}
        >
          <SafeAreaView
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 12,
              paddingTop: 10,
              paddingBottom: 10,
              margin: 12,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 24, color: "#222" }}>
                {t("home.title")}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 0,
                  paddingVertical: 4,
                  marginTop: 2,
                }}
              >
                {/* Tappable date: opens calendar modal */}
                <TouchableOpacity
                  onPress={() => {
                    // Open the central dialog for the calendar. We create a holder
                    // so the onSelect callback can close the dialog once a date
                    // is picked.
                    const idHolder: { id?: string } = {};
                    const id = useDialogStore.getState().openDialog({
                      type: "calendar",
                      props: {
                        selectedDate,
                        height: 60, // In percents of screen height
                        enableDragging: false,
                        headerProps: { title: t("pick-a-date") },
                        // onSelect will update the selected date live
                        onSelect: (d: Date) => setSelectedDate(d),
                        // onConfirm will be called when DialogHost's Done is pressed
                        onConfirm: () => {
                          // ensure final selection is applied (already via onSelect), then close
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

                    // Format the date (without time) using locale and user prefs
                    const datePart = formatDateWithWeekday(
                      (selectedDate.toDateString() === new Date().toDateString()
                        ? currentTime
                        : selectedDate
                      ).toISOString(),
                      dateTimePreferences,
                      {
                        weekdayFormat: "long",
                        weekdayPosition: "before",
                        includeTime: false,
                        dateTimeSeparator: " at ",
                      }
                    );

                    // Format time separately so we can shrink AM/PM if present
                    let timePart = "";
                    if (includeTime) {
                      timePart = formatTimeForDisplay(
                        (selectedDate.toDateString() ===
                        new Date().toDateString()
                          ? currentTime
                          : selectedDate
                        ).toISOString(),
                        dateTimePreferences
                      );
                    }

                    // Split meridiem/suffix from timePart when present (e.g., "9:30 AM", "9:30 a.m.")
                    let mainTime = timePart;
                    let meridiem = "";
                    if (timePart) {
                      const m = timePart.match(/^(.*?)(\s+[^0-9:.,\s].*)$/u);
                      if (m) {
                        mainTime = m[1];
                        meridiem = m[2].trim();
                      }
                    }

                    return (
                      <Text style={{ fontSize: 14, color: "#444" }}>
                        {datePart}
                        {includeTime && (
                          <Text>
                            {" "}
                            <Text>{mainTime}</Text>
                            {meridiem ? (
                              <Text style={{ fontSize: 11 }}> {meridiem}</Text>
                            ) : null}
                          </Text>
                        )}
                      </Text>
                    );
                  })()}
                </TouchableOpacity>
                {/* Back to Today button when a non-today date is selected */}
                {selectedDate.toDateString() !== new Date().toDateString() && (
                  <TouchableOpacity
                    onPress={() => setSelectedDate(new Date())}
                    style={{ marginLeft: 12 }}
                  >
                    <Text
                      style={{
                        textDecorationLine: "underline",
                        textTransform: "uppercase",
                        color: "#444",
                        fontSize: 12,
                        letterSpacing: 0.5,
                      }}
                    >
                      Back to today
                    </Text>
                  </TouchableOpacity>
                )}
                {/* Calendar is opened via the central dialog store; DialogHost will render the
          registered 'calendar' dialog (see shared/dialogs/registry.tsx). */}
              </View>
            </View>

            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <TouchableOpacity
                onPress={() => showInfo(t("sage.unavailableMessage"))}
              >
                <SageIcon size={40} status={"pulsating"} auto={false} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          <ErrorBoundary>
            {/* Pass selected date into the timeline so it renders the chosen day */}
            <Timeline date={selectedDate} />
          </ErrorBoundary>

          {/* Spacer to ensure there's room below the timeline (e.g., above nav) */}
          <View
            style={{
              height: DIALOG_HEIGHT_PLACEHOLDER,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {/* Reopen Activity Dialog Button - shown when dialog is closed */}
            {!isActivityDialogOpen && (
              <CdButton
                title={t("activity.legend.reopen")}
                onPress={reopenActivityDialog}
                variant="outline"
                size="medium"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  borderColor: "rgba(255, 255, 255, 0.3)",
                }}
                textStyle={{
                  color: "#333",
                }}
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
