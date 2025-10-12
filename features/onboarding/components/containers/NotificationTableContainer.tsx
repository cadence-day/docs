import React from "react";
import { useOnboardingStore } from "../../store/useOnboardingStore";
import { NotificationTable } from "../ui/NotificationTable";

export const NotificationTableContainer: React.FC = () => {
  const { notificationSchedule } = useOnboardingStore();

  return (
    <NotificationTable
      notificationSchedule={notificationSchedule}
    />
  );
};