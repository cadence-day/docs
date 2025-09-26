import React from "react";
import { useOnboardingStore } from "../../store/useOnboardingStore";
import { ActivityPicker } from "../ui/ActivityPicker";

interface ActivityPickerContainerProps {
  footer?: string;
}

export const ActivityPickerContainer: React.FC<ActivityPickerContainerProps> = ({
  footer,
}) => {
  const { selectedActivities, toggleActivity } = useOnboardingStore();

  return (
    <ActivityPicker
      footer={footer}
      selectedActivities={selectedActivities}
      onToggleActivity={toggleActivity}
    />
  );
};