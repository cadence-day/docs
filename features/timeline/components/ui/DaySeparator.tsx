// DaySeparator.tsx
import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { useI18n } from "@/shared/hooks/useI18n";
import { useDateTimePreferences } from "@/shared/hooks/useDateTimePreferences";
import { formatDateWithWeekday } from "@/shared/utils/datetime";
import { styles } from "../../styles";

interface DaySeparatorProps {
  visible: boolean;
  showYesterday: boolean;
  onPress?: () => void;
}

/**
 * Component to display a separator between yesterday and today's timeslices
 */
export const DaySeparator: React.FC<DaySeparatorProps> = ({
  visible,
  showYesterday,
  onPress,
}) => {
  const { t } = useI18n();
  const dateTimePreferences = useDateTimePreferences();

  if (!visible) return null;

  return (
    <TouchableOpacity
      style={styles.daySeparatorTouchable}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}>
      <Text numberOfLines={1} style={styles.daySeparatorText}>
        {formatDateWithWeekday(new Date().toISOString(), dateTimePreferences, {
          weekdayFormat: "long",
          weekdayPosition: "before",
        })}
      </Text>
    </TouchableOpacity>
  );
};
