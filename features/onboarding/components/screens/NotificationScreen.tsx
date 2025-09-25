import React, { useState } from "react";
import { Text, View } from "react-native";
import { CdButton } from "../../../../shared/components/CadenceUI";
import { onboardingStyles as styles } from "../../styles";
import { OnboardingPage, NotificationTime } from "../../types";

interface NotificationScreenProps {
  pageData: OnboardingPage;
  onScheduleChange?: (schedule: NotificationTime[]) => void;
}

const DEFAULT_SCHEDULE: NotificationTime[] = [
  { label: "Morning", time: "8:00", enabled: true },
  { label: "Noon", time: "12:00", enabled: true },
  { label: "Evening", time: "19:00", enabled: true },
];

export const NotificationScreen: React.FC<NotificationScreenProps> = ({
  pageData,
  onScheduleChange
}) => {
  const [schedule] = useState<NotificationTime[]>(
    pageData.notificationSchedule || DEFAULT_SCHEDULE
  );

  const handleAllowNotifications = () => {
    onScheduleChange?.(schedule);
    pageData.actionButton?.onPress();
  };

  return (
    <View style={styles.screenContainer}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{pageData.title}</Text>
        <Text style={styles.content}>{pageData.content}</Text>

        <View style={styles.notificationSchedule}>
          {schedule.map((item, index) => (
            <View key={index} style={styles.notificationItem}>
              <Text style={styles.notificationLabel}>{item.label}</Text>
              <Text style={styles.notificationTime}>{item.time}</Text>
            </View>
          ))}
        </View>

        {pageData.actionButton && (
          <CdButton
            title={pageData.actionButton.text}
            onPress={handleAllowNotifications}
            variant="outline"
            style={styles.actionButton}
          />
        )}
      </View>
    </View>
  );
};