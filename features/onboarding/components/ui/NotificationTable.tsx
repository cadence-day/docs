import React from "react";
import { Text, View } from "react-native";
import { onboardingStyles as styles } from "../../styles";
import { NotificationTime } from "../../types";

interface NotificationTableProps {
  notificationSchedule: NotificationTime[];
}

export const NotificationTable: React.FC<NotificationTableProps> = ({
  notificationSchedule,
}) => {
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
    </View>
  );
};
