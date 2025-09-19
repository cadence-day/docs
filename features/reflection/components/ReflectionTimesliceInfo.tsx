import { COLORS } from "@/shared/constants/COLORS";
import { useI18n } from "@/shared/hooks/useI18n";
import { Star } from "phosphor-react-native";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { reflectionStyles } from "../styles";
import type { EnhancedTimesliceInformation } from "../types";

interface ReflectionTimesliceInfoProps {
  timesliceInfo: EnhancedTimesliceInformation | null;
}

// Mood indicator component
const MoodIndicator: React.FC<{ mood: number; maxMood?: number }> = ({
  mood,
  maxMood = 5,
}) => {
  return (
    <View style={styles.moodContainer}>
      {Array.from({ length: maxMood }, (_, index) => (
        <View
          key={index}
          style={[
            styles.moodCircle,
            index < mood ? styles.moodCircleFilled : styles.moodCircleEmpty,
          ]}
        />
      ))}
    </View>
  );
};

// Read-only note display component using SwipeableNoteItem styles
const ReadOnlyNoteItem: React.FC<{
  note: {
    id: string | null;
    message: string | null;
    timeslice_id: string | null;
    user_id: string | null;
    isPinned?: boolean;
  };
  showPinIndicator?: boolean;
}> = ({ note, showPinIndicator = true }) => {
  return (
    <View style={styles.noteContainer}>
      <View
        style={[styles.noteItemContainer, note.isPinned && styles.pinnedNote]}
      >
        <Text style={styles.noteInput}>{note.message || ""}</Text>

        {note.isPinned && showPinIndicator && (
          <View style={styles.pinIndicator}>
            <Star size={16} color="#6366F1" />
          </View>
        )}
      </View>
    </View>
  );
};

// Read-only notes display
const ReadOnlyNotesDisplay: React.FC<{
  notes: {
    id: string | null;
    message: string | null;
    timeslice_id: string | null;
    user_id: string | null;
    isPinned?: boolean;
  }[];
  showPinIndicator?: boolean;
}> = ({ notes, showPinIndicator = true }) => {
  return (
    <View>
      {notes.map((note, index) => (
        <ReadOnlyNoteItem
          key={note.id || `note-${index}`}
          note={note}
          showPinIndicator={showPinIndicator}
        />
      ))}
    </View>
  );
};

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
    activityStats,
  } = timesliceInfo;

  // Format date and time
  const formatDateTime = () => {
    if (!timeslice?.start_time) return "";
    const date = new Date(timeslice.start_time);
    const dateStr = date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
    const timeStr = date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${dateStr} at ${timeStr}`;
  };

  // Get mood value (convert from 1-10 to 1-5 scale if needed)
  const moodValue = state?.energy
    ? Math.min(Math.ceil(state.energy / 2), 5)
    : 0;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Date and Time */}
        <Text style={styles.dateTime}>{formatDateTime()}</Text>

        {/* Daily Total */}
        <View style={styles.statsRow}>
          <Text style={styles.statsLabel}>DAILY TOTAL</Text>
          <Text style={styles.statsValue}>
            {hoursOfActivityInDay.toFixed(1)} hours
          </Text>
        </View>

        {/* Mood Indicators */}
        <View style={styles.statsRow}>
          <Text style={styles.statsLabel}>ENERGY</Text>
          <MoodIndicator mood={moodValue} />
        </View>

        {/* Average Energy for Activity */}
        {activityStats?.averageEnergy !== null &&
          activityStats?.averageEnergy !== undefined && (
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>AVG ENERGY (WEEK)</Text>
              <MoodIndicator
                mood={Math.min(Math.ceil(activityStats.averageEnergy / 2), 5)}
              />
            </View>
          )}

        {/* Note Section */}
        {noteList && noteList.length > 0 && (
          <View style={styles.notesSection}>
            <Text style={styles.noteLabel}>NOTES</Text>
            <ReadOnlyNotesDisplay notes={noteList} />
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: "2%",
  },
  activityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  activityColorBar: {
    width: 60,
    height: 24,
    borderRadius: 4,
    marginRight: 12,
  },
  activityName: {
    fontSize: 28,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  dateTime: {
    fontSize: 16,
    color: "#8E8E93",
    marginBottom: 24,
    textAlign: "left",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  statsLabel: {
    fontSize: 14,
    color: "#8E8E93",
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  statsValue: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  moodContainer: {
    flexDirection: "row",
    gap: 8,
  },
  moodCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#8E8E93",
  },
  moodCircleFilled: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  moodCircleEmpty: {
    backgroundColor: "transparent",
    borderColor: "#48484A",
  },
  noteSection: {
    marginTop: 16,
  },
  notesSection: {
    marginTop: 16,
  },
  noteLabel: {
    fontSize: 14,
    color: "#8E8E93",
    fontWeight: "500",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  noteText: {
    fontSize: 16,
    color: "#FFFFFF",
    lineHeight: 24,
  },
  // Note item styles (from SwipeableNoteItem)
  noteContainer: {
    position: "relative",
    marginBottom: 12,
  },
  noteItemContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    minHeight: 60,
    position: "relative",
  },
  pinnedNote: {
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    borderColor: "rgba(99, 102, 241, 0.3)",
  },
  noteInput: {
    color: "#FFFFFF",
    fontSize: 16,
    padding: 16,
    paddingRight: 16,
    minHeight: 60,
    textAlignVertical: "top",
  },
  pinIndicator: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ReflectionTimesliceInfo;
