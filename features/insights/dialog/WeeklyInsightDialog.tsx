import { COLORS } from "@/shared/constants/COLORS";
import { TYPOGRAPHY } from "@/shared/constants/TYPOGRAPHY";
import { useDialogStore } from "@/shared/stores";
import React, { useEffect } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { StreakVisualization } from "../components/StreakVisualization";
import { useWeeklyInsights } from "../hooks/useWeeklyInsights";

interface WeeklyInsightDialogProps {
  _dialogId?: string;
}

export const WeeklyInsightDialog: React.FC<WeeklyInsightDialogProps> = ({
  _dialogId,
}) => {
  const { setDialogProps, closeDialog } = useDialogStore();
  const { insights, loading, error } = useWeeklyInsights();

  // Handle dialog close
  const handleClose = () => {
    if (_dialogId) {
      closeDialog(_dialogId);
    }
  };

  // Set dialog header props
  useEffect(() => {
    if (!_dialogId) return;

    setDialogProps(_dialogId, {
      headerProps: {
        title: "Weekly Insights",
        rightActionElement: "Close",
        onRightAction: handleClose,
        titleFontSize: 18,
        rightActionFontSize: 14,
        headerAsButton: true,
        onHeaderPress: handleClose,
      },
      height: 85,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_dialogId]);

  // Format time for display (e.g., "2h 30m")
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);

    if (hours === 0) {
      return `${mins}m`;
    }
    if (mins === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${mins}m`;
  };

  // Show loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Loading insights...</Text>
        </View>
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            Failed to load insights. Please try again.
          </Text>
        </View>
      </View>
    );
  }

  // Show empty state
  if (!insights) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            No data available for this time period.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Two-column grid for activity stats */}
      <View style={styles.gridContainer}>
        {/* Most Time Spent */}
        {insights.mostTimeActivity && (
          <View style={styles.gridItem}>
            <Text style={styles.label}>MOST TIME</Text>
            <Text style={styles.value}>
              {insights.mostTimeActivity.activityName} –{" "}
              {formatTime(insights.mostTimeActivity.totalMinutes)}
            </Text>
          </View>
        )}

        {/* Least Time Spent */}
        {insights.leastTimeActivity && (
          <View style={styles.gridItem}>
            <Text style={styles.label}>LEAST TIME SPENT</Text>
            <Text style={styles.value}>
              {insights.leastTimeActivity.activityName} –{" "}
              {formatTime(insights.leastTimeActivity.totalMinutes)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.divider} />

      {/* Notes and Words Grid - Always show */}
      <View style={styles.gridContainer}>
        <View style={styles.gridItem}>
          <Text style={styles.label}>YOU HAVE WRITTEN</Text>
          <Text style={styles.value}>
            {insights.noteStats.totalNotes}{" "}
            {insights.noteStats.totalNotes === 1 ? "note" : "notes"}
          </Text>
        </View>

        <View style={styles.gridItem}>
          <Text style={styles.label}>YOU HAVE WRITTEN</Text>
          <Text style={styles.value}>{insights.noteStats.totalWords} words</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Mood Grid */}
      {insights.moodStats.mostFrequentMood && (
        <>
          <View style={styles.gridContainer}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>YOU HAVE WRITTEN</Text>
              <Text style={styles.value}>
                {insights.moodStats.mostFrequentMood}
              </Text>
            </View>

            {/* Most Frequent Activity */}
            {insights.mostFrequentActivity && (
              <View style={styles.gridItem}>
                <Text style={styles.label}>YOU HAVE WRITTEN</Text>
                <Text style={styles.value}>
                  {insights.mostFrequentActivity.activityName}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.divider} />
        </>
      )}

      {/* Weekly Streak */}
      <View style={styles.section}>
        <Text style={styles.label}>WEEKLY STREAK</Text>
        <StreakVisualization streakData={insights.weeklyStreak} type="weekly" />
        <Text style={styles.streakText}>
          {insights.weeklyStreak.currentStreak}{" "}
          {insights.weeklyStreak.currentStreak === 1 ? "day" : "days"} of
          continuity
        </Text>
      </View>

      <View style={styles.divider} />

      {/* Monthly Streak */}
      <View style={styles.section}>
        <Text style={styles.label}>MONTHLY STREAK</Text>
        <StreakVisualization
          streakData={insights.monthlyStreak}
          type="monthly"
        />
        <Text style={styles.streakText}>
          {insights.monthlyStreak.currentStreak}{" "}
          {insights.monthlyStreak.currentStreak === 1 ? "day" : "days"} of
          continuity
        </Text>
        {insights.monthlyStreak.longestStreak >
          insights.monthlyStreak.currentStreak && (
          <Text style={styles.motivationalText}>
            Keep going! Your previous record was{" "}
            {insights.monthlyStreak.longestStreak} days.
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  gridContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  gridItem: {
    flex: 1,
    paddingHorizontal: 8,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontFamily: TYPOGRAPHY.fontFamilies.primary,
    fontSize: 11,
    color: "#A1A1A1",
    letterSpacing: 1.54,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  value: {
    fontFamily: TYPOGRAPHY.fontFamilies.primary,
    fontSize: 17,
    color: COLORS.neutral.white,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: "#5E5E5E",
    marginBottom: 24,
  },
  streakText: {
    fontFamily: TYPOGRAPHY.fontFamilies.primary,
    fontSize: 17,
    color: COLORS.neutral.white,
    marginTop: 16,
  },
  motivationalText: {
    fontFamily: TYPOGRAPHY.fontFamilies.primary,
    fontSize: 17,
    color: COLORS.neutral.white,
    marginTop: 12,
    lineHeight: 22,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    ...TYPOGRAPHY.body.medium,
    color: "#A1A1A1",
    textAlign: "center",
  },
});
