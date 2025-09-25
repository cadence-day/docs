export type OnboardingScreenType =
  | "welcome"
  | "activity-selection"
  | "time-logging"
  | "pattern-view"
  | "note-taking"
  | "notifications";

export interface OnboardingPage {
  id: string;
  type: OnboardingScreenType;
  title: string;
  content: string;
  icon?: React.ReactNode;
  iconType?: "onboarding" | "sage" | null;
  actionButton?: {
    text: string;
    onPress: () => void;
  };
  linkText?: {
    text: string;
    onPress: () => void;
  };
  footer?: string;
  // Enhanced properties for complex screens
  activities?: string[];
  selectedActivities?: string[];
  timeSlots?: TimeSlot[];
  notificationSchedule?: NotificationTime[];
  showMoodTracker?: boolean;
  customComponent?: React.ComponentType<Record<string, unknown>>;
}

export interface TimeSlot {
  time: string;
  activity?: string;
  color?: string;
  selected?: boolean;
}

export interface NotificationTime {
  label: string;
  time: string;
  enabled: boolean;
}

export interface ActivityTag {
  id: string;
  label: string;
  selected: boolean;
  color?: string;
}
