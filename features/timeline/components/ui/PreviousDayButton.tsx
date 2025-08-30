// PreviousDayButton.tsx
import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { useI18n } from "@/shared/hooks/useI18n";
import { styles } from "../../styles";

interface PreviousDayButtonProps {
  visible: boolean;
  onPress: () => void;
}

/**
 * Button component to load and navigate to previous day's timeslices
 */
export const PreviousDayButton: React.FC<PreviousDayButtonProps> = ({
  visible,
  onPress,
}) => {
  const { t } = useI18n();

  if (!visible) return null;

  return (
    <TouchableOpacity
      style={styles.previousDayButtonTouchable}
      onPress={onPress}>
      <Text numberOfLines={1} style={styles.previousDayButtonText}>
        {t("timeline.previousDay")}
      </Text>
    </TouchableOpacity>
  );
};
