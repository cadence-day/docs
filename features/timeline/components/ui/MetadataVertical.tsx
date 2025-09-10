import { styles } from "@/features/timeline/styles";
import NoteIcon from "@/shared/components/icons/NoteIcon";
import { COLORS } from "@/shared/constants/COLORS";
import { Lightning } from "phosphor-react-native";
import React from "react";
import { Text, View } from "react-native";

interface Props {
  noteCount?: number;
  energy?: number | null;
  iconColor?: string | undefined;
}

const MetadataVertical: React.FC<Props> = ({
  noteCount,
  energy: stateNumber,
  iconColor,
}) => {
  return (
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
    </View>
  );
};

export default MetadataVertical;
