import { create } from "zustand";
import { ProfileFormData, ProfileSettings } from "../types";

interface ProfileStore {
  // Profile data state
  profileData: ProfileFormData;
  settings: ProfileSettings;
  isLoading: boolean;
  error: string | null;

  // Actions
  updateProfileData: (data: Partial<ProfileFormData>) => void;
  updateSettings: (settings: Partial<ProfileSettings>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialProfileData: ProfileFormData = {
  name: "",
  username: "",
  email: "",
  phoneNumber: "",
  avatarUrl: "",
};

const initialSettings: ProfileSettings = {
  wakeTime: "07:30",
  sleepTime: "23:30",
  notifications: {
    morningReminders: true,
    eveningReminders: false,
    weeklyStreaks: true,
  },
  subscriptionPlan: "free",
};

export const useProfileStore = create<ProfileStore>((set, get) => ({
  // Initial state
  profileData: initialProfileData,
  settings: initialSettings,
  isLoading: false,
  error: null,

  // Actions
  updateProfileData: (data: Partial<ProfileFormData>) =>
    set((state) => ({
      profileData: { ...state.profileData, ...data },
    })),

  updateSettings: (newSettings: Partial<ProfileSettings>) =>
    set((state) => ({
      settings: {
        ...state.settings,
        ...newSettings,
        // Handle nested notifications object properly
        notifications: newSettings.notifications
          ? { ...state.settings.notifications, ...newSettings.notifications }
          : state.settings.notifications,
      },
    })),

  setLoading: (isLoading: boolean) => set({ isLoading }),

  setError: (error: string | null) => set({ error }),

  reset: () =>
    set({
      profileData: initialProfileData,
      settings: initialSettings,
      isLoading: false,
      error: null,
    }),
}));
