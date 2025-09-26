import { styles } from "@/features/timeline/styles";
import NoteIcon from "@/shared/components/icons/NoteIcon";
import { COLORS } from "@/shared/constants/COLORS";
import { HIT_SLOP_10 } from "@/shared/constants/hitSlop";
import { getMoodIcon } from "@/shared/utils/moodUtils";
import { Lightning } from "phosphor-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface Props {
  noteCount?: number;
  energy?: number | null;
  mood?: number | null;
  iconColor?: string | undefined;
  onPress?: () => void;
}

const MetadataVertical: React.FC<Props> = ({
  noteCount,
  energy: stateNumber,
  mood,
  iconColor,
  onPress,
}) => {
  const moodIcon = getMoodIcon(mood ?? null, iconColor ?? COLORS.textIcons, {
    size: 20,
  });

  return (
    <TouchableOpacity onPress={onPress} hitSlop={HIT_SLOP_10}>
      <View style={styles.metadataContainer}>
        {/* Note bubble */}
        {typeof noteCount !== "undefined" && noteCount > 0 && (
          <View style={styles.metadataRow}>
            <NoteIcon color={iconColor ?? COLORS.textIcons} size="small" />
            <Text
              style={[
                { color: iconColor ?? COLORS.textIcons },
                styles.metadataCountText,
              ]}
            >
              {String(noteCount)}
            </Text>
          </View>
        )}

        {/* Lightning state */}
        {typeof stateNumber !== "undefined" && stateNumber !== null && (
          <View style={styles.metadataRow}>
            <Lightning
              size={12}
              color={iconColor ?? COLORS.textIcons}
              weight="regular"
            />
            <Text
              style={[
                { color: iconColor ?? COLORS.textIcons },
                styles.metadataEnergyText,
              ]}
            >
              {String(Math.max(1, Math.min(5, stateNumber)))}
            </Text>
          </View>
        )}

        {/* Mood icon */}
        {moodIcon && <View style={styles.metadataRow}>{moodIcon}</View>}
      </View>
    </TouchableOpacity>
  );
};

export default MetadataVertical;
