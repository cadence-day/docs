import { create } from 'zustand';
import { NotificationTime } from '../types';

interface OnboardingStoreState {
  selectedActivities: string[];
  notificationSchedule: NotificationTime[];
  allowNotifications: boolean;
  setSelectedActivities: (activities: string[]) => void;
  setNotificationSchedule: (schedule: NotificationTime[]) => void;
  setAllowNotifications: (allow: boolean) => void;
  toggleActivity: (activityId: string) => void;
  toggleNotification: (index: number) => void;
  resetStore: () => void;
  getOnboardingData: () => {
    selectedActivities: string[];
    allowNotifications: boolean;
  };
}

const DEFAULT_NOTIFICATION_SCHEDULE: NotificationTime[] = [
  { label: "Morning", time: "8:00", enabled: true },
  { label: "Noon", time: "12:00", enabled: true },
  { label: "Evening", time: "19:00", enabled: true },
];

export const useOnboardingStore = create<OnboardingStoreState>((set, get) => ({
  selectedActivities: [],
  notificationSchedule: DEFAULT_NOTIFICATION_SCHEDULE,
  allowNotifications: false,

  setSelectedActivities: (activities: string[]) =>
    set({ selectedActivities: activities }),

  setNotificationSchedule: (schedule: NotificationTime[]) =>
    set({ notificationSchedule: schedule }),

  setAllowNotifications: (allow: boolean) =>
    set({ allowNotifications: allow }),

  toggleActivity: (activityId: string) => set((state) => ({
    selectedActivities: state.selectedActivities.includes(activityId)
      ? state.selectedActivities.filter(id => id !== activityId)
      : [...state.selectedActivities, activityId]
  })),

  toggleNotification: (index: number) => set((state) => ({
    notificationSchedule: state.notificationSchedule.map((item, i) =>
      i === index ? { ...item, enabled: !item.enabled } : item
    )
  })),

  resetStore: () => set({
    selectedActivities: [],
    notificationSchedule: DEFAULT_NOTIFICATION_SCHEDULE,
    allowNotifications: false,
  }),

  getOnboardingData: () => {
    const state = get();
    return {
      selectedActivities: state.selectedActivities,
      allowNotifications: state.allowNotifications,
    };
  },
}));