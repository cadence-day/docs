import { HIT_SLOP_10 } from "@/shared/constants/hitSlop";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { ScreenHeader } from "@/shared/components/CadenceUI";
import { backgroundLinearColors } from "@/shared/constants/COLORS";
import { useI18n } from "@/shared/hooks/useI18n";

import SageIcon from "@/shared/components/icons/SageIcon";
import LoadingScreen from "../(utils)/LoadingScreen";
const ReflectionGrid = React.lazy(() =>
  import("@/features/reflection").then((m) => ({ default: m.ReflectionGrid }))
);

export default function Reflection() {
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const { t } = useI18n();

  const getStartOfWeek = (date: Date) => {
    const localDate = new Date(date);
    const day = localDate.getDay();
    const diff = localDate.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(localDate);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0); // Set to start of day in local time
    return monday;
  };

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day

    const startOfWeek = getStartOfWeek(today);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    setFromDate(startOfWeek);
    setToDate(endOfWeek);
  }, []);

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

  // Check if we're at the current week to disable next week navigation
  const isAtCurrentWeek = () => {
    const today = new Date();
    const currentWeekStart = getStartOfWeek(today);
    return fromDate.getTime() === currentWeekStart.getTime();
  };

  return (
    <LinearGradient
      colors={[
        backgroundLinearColors.primary.start,
        backgroundLinearColors.primary.end,
      ]}
      style={styles.container}
    >
      <ScreenHeader
        title={t("reflection.weekly-cadence")}
        OnRightElement={() => (
          <SageIcon
            size={40}
            status="pulsating"
            auto={false}
            isLoggedIn={true}
          />
        )}
        subtitle={
          <View style={styles.dateNavigationContainer}>
            <TouchableOpacity
              onPress={handlePreviousWeek}
              hitSlop={HIT_SLOP_10}
            >
              <Text style={styles.dateRangeArrow}>←</Text>
            </TouchableOpacity>

            <Text style={styles.dateRangeText}>
              {fromDate.toLocaleDateString()} to {toDate.toLocaleDateString()}
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
        }
      />

      <View style={styles.gridContainer}>
        <React.Suspense fallback={<LoadingScreen />}>
          <ReflectionGrid
            fromDate={fromDate}
            toDate={toDate}
            refreshing={refreshing}
            setRefreshing={setRefreshing}
          />
        </React.Suspense>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gridContainer: {
    flex: 1,
    marginHorizontal: 12,
    marginBottom: 5,
  },
  dateNavigationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  dateRangeText: {
    marginHorizontal: 6,
    fontSize: 14,
    color: "#444",
  },
  dateRangeArrow: {
    fontSize: 14,
    color: "#444",
  },
  dateRangeArrowDisabled: {
    color: "#ccc",
  },
});
