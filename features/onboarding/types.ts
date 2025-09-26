export interface OnboardingPage {
  id: string;
  type: string;
  title?: string;
  content?: string;
  footer?: string;
  actionButton?: {
    text: string;
    onPress: () => void;
  };
}

export interface OnboardingScreenProps {
  pageData: OnboardingPage;
  onNext?: () => void;
  onPrevious?: () => void;
  onButtonPress?: () => void;
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
