import { HIT_SLOP_10 } from "@/shared/constants/hitSlop";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { ScreenHeader } from "@/shared/components/CadenceUI";
import SageIcon from "@/shared/components/icons/SageIcon";
import { backgroundLinearColors } from "@/shared/constants/COLORS";
import { useI18n } from "@/shared/hooks/useI18n";

import LoadingScreen from "../(utils)/LoadingScreen";
const ReflectionGrid = React.lazy(() =>
  import("@/features/reflection").then((m) => ({ default: m.ReflectionGrid }))
);

export default function Reflection() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const { t } = useI18n();

  // Generate date range for horizontal scrolling (show 7 days: 3 before + current + 3 after)
  const getDatesForHorizontalView = (centerDate: Date) => {
    const dates = [];
    for (let i = -3; i <= 3; i++) {
      const date = new Date(centerDate);
      date.setDate(centerDate.getDate() + i);
      date.setHours(0, 0, 0, 0);
      dates.push(date);
    }
    return dates;
  };

  const dates = getDatesForHorizontalView(currentDate);
  const fromDate = dates[0];
  const toDate = new Date(dates[dates.length - 1]);
  toDate.setHours(23, 59, 59, 999);

  const handlePreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 1);

    // Check if the new date would be in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Prevent navigation beyond today
    if (newDate > today) {
      return; // Don't allow navigation to future dates
    }

    setCurrentDate(newDate);
  };

  // Check if we're at today to disable next day navigation
  const isAtToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const current = new Date(currentDate);
    current.setHours(0, 0, 0, 0);
    return current.getTime() === today.getTime();
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
        title={t("reflection.daily-cadence") || "Daily Cadence"}
        OnRightElement={() => (
          <SageIcon size={28} status="pulsating" auto={false} />
        )}
        subtitle={
          <View style={styles.dateNavigationContainer}>
            <TouchableOpacity onPress={handlePreviousDay} hitSlop={HIT_SLOP_10}>
              <Text style={styles.arrowText}>←</Text>
            </TouchableOpacity>

            <Text style={styles.dateRangeText}>
              {currentDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>

            <TouchableOpacity
              onPress={handleNextDay}
              disabled={isAtToday()}
              hitSlop={HIT_SLOP_10}
            >
              <Text
                style={
                  isAtToday() ? styles.arrowTextDisabled : styles.arrowText
                }
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
  arrowText: {
    fontSize: 14,
    color: "#444",
  },
  arrowTextDisabled: {
    fontSize: 14,
    color: "#ccc",
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
});
