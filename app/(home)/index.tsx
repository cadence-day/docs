import { SignedIn, SignedOut } from "@clerk/clerk-expo";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";

import Timeline from "@/features/timeline/Timeline";
import { CdButton } from "@/shared/components/CadenceUI";
import SageIcon from "@/shared/components/icons/SageIcon";
import { backgroundLinearColors } from "@/shared/constants/COLORS";
import { DIALOG_HEIGHT_PLACEHOLDER } from "@/shared/constants/VIEWPORT";
import { useDeviceDateTime } from "@/shared/hooks/useDeviceDateTime";
import SignIn from "../(auth)/sign-in";

// Provide tiny fallbacks if these shared components don't exist in the repo.
const ErrorBoundary: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => <>{children}</>;

// Stores

import { useToast } from "@/shared/hooks";
import { useI18n } from "@/shared/hooks/useI18n";
import useDialogStore from "@/shared/stores/useDialogStore";

export default function Today() {
  const { t } = useI18n();
  const {
    prefs,
    formatDate,
    formatTime,
    getDateTimeSeparator,
    displayDateTime,
  } = useDeviceDateTime();
  const { showInfo } = useToast();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);

  useEffect(() => {
    setCurrentTime(new Date());
    const interval = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  // Open activity dialog by default as persistent and view-specific
  useEffect(() => {
    const openActivityLegend = () => {
      const id = useDialogStore.getState().openDialog({
        type: "activity",
        props: {
          mode: "legend",
          preventClose: true, // Make it persistent
        },
        position: "dock",
        viewSpecific: "index", // Specific to today view (index route)
      });
      setIsActivityDialogOpen(true);
    };

    // Restore any existing view-specific dialogs for today view
    useDialogStore.getState().restoreViewSpecificDialogs("index");
    
    // Check if activity dialog already exists
    const existingActivityDialog = Object.values(
      useDialogStore.getState().dialogs
    ).find((dialog) => dialog.type === "activity" && dialog.viewSpecific === "index");

    if (!existingActivityDialog) {
      // Small delay to ensure stores are ready
      const timer = setTimeout(openActivityLegend, 100);
      return () => clearTimeout(timer);
    } else {
      setIsActivityDialogOpen(true);
    }
  }, []);

  // Listen to dialog store changes to track activity dialog state
  useEffect(() => {
    const unsubscribe = useDialogStore.subscribe((state) => {
      const hasActivityDialog = Object.values(state.dialogs).some(
        (dialog) => dialog.type === "activity" && dialog.viewSpecific === "index"
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
      viewSpecific: "index", // Specific to today view
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
                        headerProps: {
                          title: t("calendarDialog.pick-a-date"),
                        },
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

                    // Use displayDateTime to get a single formatted string. If
                    // includeTime is false it returns just the date; otherwise it
                    // returns "<date> <preposition> <time>".
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
                      <Text
                        style={{
                          fontSize: 14,
                          color: "#444",
                          textDecorationLine: "underline",
                        }}
                      >
                        {displayed}
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
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Text
                        style={{
                          textTransform: "uppercase",
                          color: "#444",
                          fontSize: 12,
                          letterSpacing: 0.5,
                        }}
                      >
                        {" < "}
                      </Text>
                      <Text
                        style={{
                          textDecorationLine: "underline",
                          textTransform: "uppercase",
                          color: "#444",
                          fontSize: 12,
                          letterSpacing: 0.5,
                        }}
                      >
                        {t("back-to-today")}
                      </Text>
                    </View>
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
