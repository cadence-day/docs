import { useI18n } from "@/shared/hooks/useI18n";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { reflectionStyles } from "../styles";
import type { EnhancedTimesliceInformation } from "../types";
import LineItem from "./LineItem";

interface ReflectionTimesliceInfoProps {
  timesliceInfo: EnhancedTimesliceInformation | null;
}

const ReflectionTimesliceInfo: React.FC<ReflectionTimesliceInfoProps> = ({
  timesliceInfo,
}) => {
  const { t } = useI18n();

  if (!timesliceInfo) {
    return (
      <View style={reflectionStyles.timesliceInfoContainer}>
        <Text style={reflectionStyles.timesliceInfoNoDataText}>
          {t("reflection.noTimesliceInfo")}
        </Text>
      </View>
    );
  }

  const {
    timeslice,
    activity,
    noteList,
    state,
    energyLevel,
    statistics,
    hoursOfActivityInView = 0,
    hoursOfActivityInDay = 0,
  } = timesliceInfo;

  // Get statistics for this specific activity if available
  const activityStats =
    activity && statistics?.activitiesStats
      ? statistics.activitiesStats.find(
          (stat) => stat.activityId === activity.id
        )
      : undefined;

  return (
    <ScrollView
      style={reflectionStyles.timesliceInfoContainer}
      contentContainerStyle={reflectionStyles.timesliceInfoContent}
    >
      {/* Activity Information */}
      {activity && (
        <LineItem
          label={t("reflection.activityLabel")}
          value={activity.name || t("reflection.unknownActivity")}
        />
      )}

      {/* Energy Level */}
      {energyLevel !== null && (
        <LineItem
          label={t("reflection.energyLevel")}
          value={`${energyLevel}/10`}
        />
      )}

      {/* State/Mood */}
      {state?.mood && (
        <LineItem label={t("reflection.mood")} value={state.mood.toString()} />
      )}

      {/* Activity Statistics */}
      {activityStats && (
        <>
          <LineItem
            label={t("reflection.totalSessions")}
            value={`${activityStats.totalTimeslices} ${t("reflection.timeslices")}`}
          />

          <LineItem
            label={t("reflection.totalTime")}
            value={`${activityStats.totalHours.toFixed(2)} ${t("reflection.hours")}`}
          />

          {activityStats.averageEnergy !== null && (
            <LineItem
              label={t("reflection.avgEnergy")}
              value={`${activityStats.averageEnergy.toFixed(1)}/10`}
            />
          )}

          <LineItem
            label={t("reflection.notesCount")}
            value={`${activityStats.totalNotes} ${t("reflection.notes")}`}
          />
        </>
      )}

      {/* Period Totals */}
      <LineItem
        label={
          activity
            ? `${t("reflection.dailyTotal")} (${activity.name})`
            : t("reflection.dailyTotal")
        }
        value={hoursOfActivityInDay.toFixed(2) + " " + t("reflection.hours")}
      />

      <LineItem
        label={
          activity
            ? `${t("reflection.periodTotal")} (${activity.name})`
            : t("reflection.periodTotal")
        }
        value={hoursOfActivityInView.toFixed(2) + " " + t("reflection.hours")}
      />

      {/* Notes for this timeslice */}
      {noteList && noteList.length > 0 && (
        <>
          <View style={reflectionStyles.timesliceInfoNotesHeader}>
            <Text style={reflectionStyles.timesliceInfoNotesHeaderText}>
              {t("reflection.notesForSession")}
            </Text>
          </View>
          {noteList.map((note, idx) => (
            <LineItem
              key={note.id || idx}
              label={`${t("reflection.note")} ${idx + 1}`}
              isNote={true}
              value={note.message || ""}
            />
          ))}
        </>
      )}

      {/* Overall Statistics Summary */}
      {statistics && (
        <>
          <View style={reflectionStyles.timesliceInfoStatsHeader}>
            <Text style={reflectionStyles.timesliceInfoStatsHeaderText}>
              {t("reflection.periodSummary")}
            </Text>
          </View>
          <LineItem
            label={t("reflection.totalActivities")}
            value={`${statistics.activitiesStats.length} ${t("reflection.activities")}`}
          />
          <LineItem
            label={t("reflection.totalSessions")}
            value={`${statistics.totalTimeslices} ${t("reflection.timeslices")}`}
          />
          <LineItem
            label={t("reflection.totalTime")}
            value={`${statistics.totalHours.toFixed(2)} ${t("reflection.hours")}`}
          />
          <LineItem
            label={t("reflection.notesCount")}
            value={`${statistics.totalNotes} ${t("reflection.notes")}`}
          />
          {statistics.overallAverageEnergy !== null && (
            <LineItem
              label={t("reflection.overallAvgEnergy")}
              value={`${statistics.overallAverageEnergy.toFixed(1)}/10`}
            />
          )}
        </>
      )}
    </ScrollView>
  );
};

export default ReflectionTimesliceInfo;
