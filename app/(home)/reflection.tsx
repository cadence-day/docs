import { HIT_SLOP_10 } from "@/shared/constants/hitSlop";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { ScreenHeader } from "@/shared/components/CadenceUI";
import { useTheme } from "@/shared/hooks";
import { useI18n } from "@/shared/hooks/useI18n";
import { useFeatureFlag } from "@/shared/hooks/useFeatureFlags";

import SageIcon from "@/shared/components/icons/SageIcon";
import { useDialogStore } from "@/shared/stores";
import { SafeAreaView } from "react-native-safe-area-context";
import LoadingScreen from "../(utils)/LoadingScreen";
import { generalStyles } from "../../shared/styles";
const ReflectionGrid = React.lazy(() =>
  import("@/features/reflection").then((m) => ({ default: m.ReflectionGrid }))
);
const MonthlyReflectionGrid = React.lazy(() =>
  import("@/features/reflection").then((m) => ({
    default: m.MonthlyReflectionGrid,
  }))
);

export default function Reflection() {
  const [viewMode, setViewMode] = useState<"weekly" | "monthly">("weekly");
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const { t } = useI18n();
  const theme = useTheme();
  const openDialog = useDialogStore((s) => s.openDialog);

  // Use the new feature flag system
  const isMonthlyReflectionEnabled = useFeatureFlag("monthly-reflection");
  const isWeeklyInsightsEnabled = useFeatureFlag("weekly-insights");

  // If monthly reflection is disabled and we're in monthly mode, switch back to weekly
  useEffect(() => {
    if (isMonthlyReflectionEnabled === false && viewMode === "monthly") {
      setViewMode("weekly");
    }
  }, [isMonthlyReflectionEnabled, viewMode]);

  const getStartOfWeek = (date: Date) => {
    const localDate = new Date(date);
    const day = localDate.getDay();
    const diff = localDate.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(localDate);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0); // Set to start of day in local time
    return monday;
  };

  const getStartOfMonth = (date: Date) => {
    const localDate = new Date(date);
    localDate.setDate(1);
    localDate.setHours(0, 0, 0, 0);
    return localDate;
  };

  const getEndOfMonth = (date: Date) => {
    const localDate = new Date(date);
    localDate.setMonth(localDate.getMonth() + 1);
    localDate.setDate(0);
    localDate.setHours(23, 59, 59, 999);
    return localDate;
  };

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day

    if (viewMode === "weekly") {
      const startOfWeek = getStartOfWeek(today);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      setFromDate(startOfWeek);
      setToDate(endOfWeek);
    } else {
      const startOfMonth = getStartOfMonth(today);
      const endOfMonth = getEndOfMonth(today);

      setFromDate(startOfMonth);
      setToDate(endOfMonth);
    }
  }, [viewMode]);

  const handlePreviousWeek = () => {
    const newFromDate = new Date(fromDate);
    newFromDate.setDate(newFromDate.getDate() - 7);
    newFromDate.setHours(0, 0, 0, 0);

    const newToDate = new Date(newFromDate);
    newToDate.setDate(newToDate.getDate() + 6);
    newToDate.setHours(23, 59, 59, 999);

    setFromDate(newFromDate);
    setToDate(newToDate);
  };

  const handleNextWeek = () => {
    const newFromDate = new Date(fromDate);
    newFromDate.setDate(newFromDate.getDate() + 7);
    newFromDate.setHours(0, 0, 0, 0);

    // Check if the new week would be in the future
    const today = new Date();
    const currentWeekStart = getStartOfWeek(today);

    // Prevent navigation beyond the current week
    if (newFromDate > currentWeekStart) {
      return; // Don't allow navigation to future weeks
    }

    const newToDate = new Date(newFromDate);
    newToDate.setDate(newToDate.getDate() + 6);
    newToDate.setHours(23, 59, 59, 999);

    setFromDate(newFromDate);
    setToDate(newToDate);
  };

  const handlePreviousMonth = () => {
    const newFromDate = new Date(fromDate);
    newFromDate.setMonth(newFromDate.getMonth() - 1);
    newFromDate.setDate(1);
    newFromDate.setHours(0, 0, 0, 0);

    const newToDate = getEndOfMonth(newFromDate);

    setFromDate(newFromDate);
    setToDate(newToDate);
  };

  const handleNextMonth = () => {
    const newFromDate = new Date(fromDate);
    newFromDate.setMonth(newFromDate.getMonth() + 1);
    newFromDate.setDate(1);
    newFromDate.setHours(0, 0, 0, 0);

    // Check if the new month would be in the future
    const today = new Date();
    const currentMonthStart = getStartOfMonth(today);

    // Prevent navigation beyond the current month
    if (newFromDate > currentMonthStart) {
      return;
    }

    const newToDate = getEndOfMonth(newFromDate);

    setFromDate(newFromDate);
    setToDate(newToDate);
  };

  // Check if we're at the current week to disable next week navigation
  const isAtCurrentWeek = () => {
    const today = new Date();
    const currentWeekStart = getStartOfWeek(today);
    return fromDate.getTime() === currentWeekStart.getTime();
  };

  // Check if we're at the current month to disable next month navigation
  const isAtCurrentMonth = () => {
    const today = new Date();
    const currentMonthStart = getStartOfMonth(today);
    return fromDate.getTime() === currentMonthStart.getTime();
  };

  // Format month display
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  // Open WeeklyInsightDialog when SageIcon is pressed (only if feature flag is enabled)
  const handleSageIconPress = () => {
    if (!isWeeklyInsightsEnabled) {
      return; // Do nothing if the feature is disabled
    }

    openDialog({
      type: "weekly-insight",
      props: {},
    });
  };

  const title =
    viewMode === "weekly" ? t("reflection.weekly-cadence") : "Monthly Cadence";

  // Handle title press - only allow monthly view if feature flag is enabled
  const handleTitlePress = () => {
    // Don't allow switching if the flag is still loading or explicitly disabled
    if (isMonthlyReflectionEnabled === undefined || isMonthlyReflectionEnabled === false) {
      return;
    }

    if (viewMode === "weekly") {
      setViewMode("monthly");
    } else if (viewMode === "monthly") {
      setViewMode("weekly");
    }
  };

  return (
    <View
      // Keep general container behavior but allow children to stretch and start at the top
      style={[
        generalStyles.container,
        styles.containerOverride,
        { backgroundColor: theme.background.primary },
      ]}
    >
      <SafeAreaView style={generalStyles.flexContainer} edges={["top"]}>
        <ScreenHeader
          title={title}
          onTitlePress={handleTitlePress}
          OnRightElement={() =>
            isWeeklyInsightsEnabled ? (
              <TouchableOpacity
                onPress={handleSageIconPress}
                hitSlop={HIT_SLOP_10}
              >
                <SageIcon
                  size={40}
                  status="pulsating"
                  auto={false}
                  isLoggedIn={true}
                />
              </TouchableOpacity>
            ) : null
          }
          subtitle={
            viewMode === "weekly" ? (
              <View style={styles.dateNavigationContainer}>
                <TouchableOpacity
                  onPress={handlePreviousWeek}
                  hitSlop={HIT_SLOP_10}
                >
                  <Text style={styles.dateRangeArrow}>←</Text>
                </TouchableOpacity>

                <Text style={styles.dateRangeText}>
                  {fromDate.toLocaleDateString()} to{" "}
                  {toDate.toLocaleDateString()}
                </Text>

                <TouchableOpacity
                  onPress={handleNextWeek}
                  disabled={isAtCurrentWeek()}
                  hitSlop={HIT_SLOP_10}
                >
                  <Text
                    style={[
                      styles.dateRangeArrow,
                      isAtCurrentWeek() && styles.dateRangeArrowDisabled,
                    ]}
                  >
                    →
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.dateNavigationContainer}>
                <TouchableOpacity
                  onPress={handlePreviousMonth}
                  hitSlop={HIT_SLOP_10}
                >
                  <Text style={styles.dateRangeArrow}>←</Text>
                </TouchableOpacity>

                <Text style={styles.dateRangeText}>
                  {formatMonthYear(fromDate)}
                </Text>

                <TouchableOpacity
                  onPress={handleNextMonth}
                  disabled={isAtCurrentMonth()}
                  hitSlop={HIT_SLOP_10}
                >
                  <Text
                    style={[
                      styles.dateRangeArrow,
                      isAtCurrentMonth() && styles.dateRangeArrowDisabled,
                    ]}
                  >
                    →
                  </Text>
                </TouchableOpacity>
              </View>
            )
          }
        />

        <View style={generalStyles.flexContainerWithMargins}>
          <React.Suspense fallback={<LoadingScreen />}>
            {viewMode === "weekly" ? (
              <ReflectionGrid
                fromDate={fromDate}
                toDate={toDate}
                refreshing={refreshing}
                setRefreshing={setRefreshing}
              />
            ) : (
              <MonthlyReflectionGrid
                fromDate={fromDate}
                toDate={toDate}
                refreshing={refreshing}
                setRefreshing={setRefreshing}
              />
            )}
          </React.Suspense>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  containerOverride: {
    alignItems: "stretch",
    justifyContent: "flex-start",
  },
  dateNavigationContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  dateRangeText: {
    marginHorizontal: 6,
    ...generalStyles.subtitle,
  },
  dateRangeArrow: {
    ...generalStyles.subtitle,
  },
  dateRangeArrowDisabled: {
    ...generalStyles.subtitle,
    color: "#ccc",
  },
});
