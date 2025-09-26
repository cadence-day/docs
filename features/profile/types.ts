export interface ProfileFormData {
  name: string;
  username: string;
  email: string;
  phoneNumber?: string;
  avatarUrl?: string;
}

export interface ProfileSettings {
  wakeTime: string; // "07:30"
  sleepTime: string; // "23:30"
  subscriptionPlan: "free" | "supporter" | "premium_supporter" | "feature_sponsor";
}

export interface UserPersona {
  type: "early_bird" | "night_owl" | "balanced" | "flexible";
  suggestedActivities: string[];
  locale: string;
}

export interface RestActivity {
  id: string;
  name: string;
  color: string;
  startTime: string;
  endTime: string;
  isSystemGenerated: boolean;
}

export interface TimePickerProps {
  mode: "wake" | "sleep";
  currentTime: string;
  onTimeChange: (time: string) => void;
}

export interface CustomerSupportDialogProps {
  userId?: string;
  userEmail?: string;
  appVersion: string;
  buildNumber: string;
}

export interface SubscriptionPlan {
  name: string;
  price: string;
  features?: string[];
}
