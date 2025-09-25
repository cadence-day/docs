import { COLORS } from "@/shared/constants/COLORS";
import { useI18n } from "@/shared/hooks/useI18n";
import { formatDateTime } from "@/shared/utils/dateTimeUtils";
import { Star } from "phosphor-react-native";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { reflectionStyles } from "../styles";
import type { EnhancedTimesliceInformation } from "../types";

interface ReflectionTimesliceInfoProps {
  timesliceInfo: EnhancedTimesliceInformation | null;
}

// Level indicator component
const LevelIndicator: React.FC<{ level: number; maxLevel?: number }> = ({
  level,
  maxLevel = 5,
}) => {
  return (
    <View style={styles.levelContainer}>
      {Array.from({ length: maxLevel }, (_, index) => (
        <View
          key={index}
          style={[
            styles.levelCircle,
            index < level ? styles.levelCircleFilled : styles.levelCircleEmpty,
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
            <Star size={16} color={COLORS.primary} />
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
    noteList,
    state,
    hoursOfActivityInDay = 0,
  } = timesliceInfo;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Date and Time */}
        <Text style={styles.dateTime}>
          {formatDateTime(timeslice?.start_time)}
        </Text>

        {/* Daily Total */}
        <View style={styles.statsRow}>
          <Text style={styles.statsLabel}>{t("daily-total")}</Text>
          <Text style={styles.statsValue}>
            {hoursOfActivityInDay.toFixed(1)}
            {t("hours")}
          </Text>
        </View>

        {/* Energy Indicators */}
        {state?.energy !== null && state?.energy !== undefined && (
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>{t("energyLabel")}</Text>
            <LevelIndicator level={state?.energy} />
          </View>
        )}

        {/* Mood Indicators */}
        {state?.mood !== null && state?.mood !== undefined && (
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>{t("mood")}</Text>
            <LevelIndicator level={state?.mood} />
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
    padding: 8,
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
    textTransform: "uppercase",
  },
  statsValue: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  levelContainer: {
    flexDirection: "row",
    gap: 8,
  },
  levelCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#8E8E93",
  },
  levelCircleFilled: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  levelCircleEmpty: {
    backgroundColor: "transparent",
    borderColor: "#48484A",
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
