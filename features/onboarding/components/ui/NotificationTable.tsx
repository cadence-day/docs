import { CdButton } from "@/shared/components/CadenceUI";
import React from "react";
import { Text, View } from "react-native";
import { useOnboardingStore } from "../../store/useOnboardingStore";
import { onboardingStyles as styles } from "../../styles";
import { NotificationTime } from "../../types";

interface NotificationTableProps {
  actionButton?: {
    text: string;
    onPress: () => void;
  };
}

export const NotificationTable: React.FC<NotificationTableProps> = ({
  actionButton,
}) => {
  const { notificationSchedule } = useOnboardingStore();

  return (
    <View style={styles.fullWidthContainer}>
      <View style={styles.notificationSchedule}>
        {notificationSchedule.map((item: NotificationTime, index: number) => (
          <View key={index} style={styles.notificationItem}>
            <Text style={styles.notificationLabel}>{item.label}</Text>
            <Text style={styles.notificationTime}>{item.time}</Text>
          </View>
        ))}
      </View>

      {actionButton && actionButton.text && actionButton.onPress && (
        <CdButton
          title={actionButton.text}
          onPress={actionButton.onPress}
          variant="outline"
          style={styles.notificationActionButton}
        />
      )}
    </View>
  );
};
