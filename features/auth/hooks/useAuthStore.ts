import { create } from "zustand";
import { AuthModal, AuthState, AuthUser } from "../utils/types";

interface AuthStore extends AuthState {
  // Profile completion state
  profileCompletionChecked: boolean;
  shouldShowOnboarding: boolean;

  // Email confirmation state
  pendingConfirmationEmail: string | null;

  // Actions
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setModalRoute: (route: AuthModal) => void;
  clearAuth: () => void;
  updateUserProfile: (updates: Partial<AuthUser>) => void;
  setProfileCompletionChecked: (checked: boolean) => void;
  setShouldShowOnboarding: (show: boolean) => void;
  setPendingConfirmationEmail: (email: string | null) => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Initial state
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
  modalRoute: null,
  profileCompletionChecked: false,
  shouldShowOnboarding: false,
  pendingConfirmationEmail: null,

  // Actions
  setUser: (user: AuthUser | null) =>
    set({
      user,
      isAuthenticated: !!user,
      // Only clear error and modal when user is successfully authenticated
      error: user ? null : get().error,
      modalRoute: user ? null : get().modalRoute,
    }),

  setLoading: (isLoading: boolean) => set({ isLoading }),

  setError: (error: string | null) => set({ error }),

  setModalRoute: (modalRoute: AuthModal) => {
    console.log("Setting modal route to:", modalRoute);
    set({ modalRoute });
  },

  clearAuth: () =>
    set({
      user: null,
      isAuthenticated: false,
      error: null,
      modalRoute: null, // Clear modal when clearing auth
      profileCompletionChecked: false,
      shouldShowOnboarding: false,
    }),

  setProfileCompletionChecked: (profileCompletionChecked: boolean) =>
    set({ profileCompletionChecked }),

  setShouldShowOnboarding: (shouldShowOnboarding: boolean) =>
    set({ shouldShowOnboarding }),

  updateUserProfile: (updates: Partial<AuthUser>) => {
    const currentUser = get().user;
    if (currentUser) {
      set({
        user: { ...currentUser, ...updates },
      });
    }
  },

  setPendingConfirmationEmail: (pendingConfirmationEmail: string | null) =>
    set({ pendingConfirmationEmail }),
}));
