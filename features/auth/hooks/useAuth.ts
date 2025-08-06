import { useEffect } from "react";
import { supabase } from "@/shared/utils/supabase";
import { useAuthStore } from "./useAuthStore";
import {
  deleteAccountAPI,
  handleAuthCallbackAPI,
  loginAPI,
  logoutAPI,
  resetPasswordAPI,
  signInWithApple as signInWithAppleAPI,
  signupAPI,
} from "../services/auth-api";
// import { restoreSession } from "../services/session";
import { setupDeepLinkListener } from "../services/deep-links";
import { AuthHookReturn, AuthModal, SignupForm } from "../utils/types";
import {
  checkProfileCompletion,
  shouldShowOnboarding as shouldShowOnboardingUtil,
} from "@/shared/utils/profileCompletion";

export const useAuth = (): AuthHookReturn => {
  const {
    user,
    isLoading,
    isAuthenticated,
    error,
    modalRoute,
    profileCompletionChecked,
    shouldShowOnboarding,
    pendingConfirmationEmail,
    setUser,
    setLoading,
    setError,
    setModalRoute,
    setProfileCompletionChecked,
    setShouldShowOnboarding,
    setPendingConfirmationEmail,
  } = useAuthStore();

  // Check user profile completion for onboarding
  const checkUserProfileCompletion = async (userId: string) => {
    try {
      console.log("Checking profile completion for user:", userId);
      const status = await checkProfileCompletion(userId);
      const showOnboarding = shouldShowOnboardingUtil(status);

      console.log("Profile completion status:", {
        isComplete: status.isComplete,
        hasProfile: status.hasProfile,
        missingFields: status.missingFields,
        shouldShowOnboarding: showOnboarding,
      });

      setProfileCompletionChecked(true);
      setShouldShowOnboarding(showOnboarding);
    } catch (error) {
      console.error("Error checking profile completion:", error);
      // On error, assume we should show onboarding for safety
      setProfileCompletionChecked(true);
      setShouldShowOnboarding(true);
      /**
       * useAuth.ts
       *
       * Cadence.day Mobile App — Auth Hook
       *
       * This custom React hook manages authentication state and workflows for the app.
       * It integrates with Supabase for auth, handles onboarding, error states, and modal routing.
       *
       * Key Responsibilities:
       * - Listens for Supabase auth state changes (login, logout, session refresh, etc.)
       * - Manages user state, loading, errors, and modal routes via zustand store
       * - Checks user profile completion to determine onboarding flow
       * - Handles deep link authentication callbacks (e.g., magic links, OAuth)
       * - Provides methods for login, signup, logout, password reset, account deletion, and Apple Sign In
       * - Exposes modal control and onboarding completion helpers
       *
       * Usage:
       *   const auth = useAuth();
       *   // Access: auth.user, auth.isAuthenticated, auth.login(), auth.logout(), etc.
       *
       * State/Store:
       *   Uses zustand store from './useAuthStore' for all auth-related state.
       *
       * Integration Points:
       *   - Supabase (auth/session)
       *   - Deep link handler (magic links, OAuth)
       *   - Profile completion check (onboarding)
       *   - All API calls via features/auth/services/auth-api
       *
       * Project Conventions:
       *   - Type safety: All user data uses types from shared/types
       *   - Modal routes: Auth modals controlled via modalRoute state
       *   - Onboarding: Profile completion checked after login/session
       *
       * See also:
       *   - features/auth/services/auth-api.ts
       *   - shared/utils/profileCompletion.ts
       *   - shared/stores/
       *
       * Author: Cadence.day Team
       * Last updated: 2025-07-24
       */
    }
  };

  // Initialize auth state
  useEffect(() => {
    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        console.log("Auth state change:", event, "Session:", !!session);

        if (session?.user) {
          const newUser = {
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email ||
              "",
            email: session.user.email || "",
            avatar_url: session.user.user_metadata?.avatar_url,
            created_at: session.user.created_at,
            last_sign_in_at: session.user.last_sign_in_at,
          };
          setUser(newUser);
          // Clear error and modal on successful authentication
          setError(null);
          setModalRoute(null);
          setLoading(false);

          // Check profile completion for onboarding
          checkUserProfileCompletion(newUser.id);
        } else if (event === "SIGNED_OUT") {
          console.log("User signed out");
          setUser(null);
          setError(null);
          setLoading(false);
        } else if (event === "INITIAL_SESSION" && !session) {
          console.log("No initial session found");
          setUser(null);
          // Only show login modal if there's no current modal route (avoid overriding error states)
          if (!modalRoute) {
            setModalRoute("login");
          }
          setLoading(false);
        } else if (event === "TOKEN_REFRESHED" && !session) {
          console.log("Token refresh failed - clearing session");
          setUser(null);
          setError("Your session has expired. Please login again.");
          setModalRoute("login"); // Show login modal when session expires
          setLoading(false);
        }
      } catch (error: any) {
        console.error("Auth error during state change:", error);
        setError("There was a problem with your session. Please login again.");
        setUser(null);
        setModalRoute("login"); // Show login modal on auth errors
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, setLoading, setError]);

  // Setup deep link handling
  useEffect(() => {
    const cleanup = setupDeepLinkListener(
      (result) => {
        console.log("=== Deep link callback result ===");
        console.log("Result:", result);

        if (result.success && result.data) {
          console.log("Deep link authentication successful, setting user");
          setUser(result.data);
          setModalRoute(null);
          setError(null);
        } else if (result.error) {
          console.error("Deep link authentication failed:", result.error);
          setError(result.error);
          // Show login modal on deep link errors
          setModalRoute("login");
        }
      },
      (route) => {
        console.log("Deep link modal route:", route);
        setModalRoute(route as any);
      },
    );

    return cleanup;
  }, [setUser, setError, setModalRoute]);

  // Auth methods
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    const result = await loginAPI(email, password);

    if (result.success && result.data) {
      setUser(result.data);
      setModalRoute(null);
    } else {
      console.log("Login failed, keeping modal open:", result.error);
      setError(result.error || "Login failed");
      // Keep the login modal open on authentication errors
      setModalRoute("login");
    }

    setLoading(false);
    return result;
  };

  const signup = async (formData: SignupForm) => {
    setLoading(true);
    setError(null);

    const result = await signupAPI(formData);

    if (result.success && result.data) {
      if (result.needsEmailConfirmation) {
        // Show email confirmation dialog instead of logging in
        console.log("Showing email confirmation dialog");
        setPendingConfirmationEmail(result.data.email);
        setModalRoute("email-confirmation");
        // Don't set user until email is confirmed
        setUser(null);
      } else {
        // User is automatically confirmed (dev mode or instant confirmation)
        console.log("User automatically confirmed, logging in");
        setUser(result.data);
        setModalRoute(null);
        setPendingConfirmationEmail(null);
      }
    } else {
      console.log("Signup failed, keeping modal open:", result.error);
      setError(result.error || "Signup failed");
      // Keep the signup modal open on authentication errors
      setModalRoute("signup");
    }

    setLoading(false);
    return result;
  };

  const logout = async () => {
    setLoading(true);
    await logoutAPI();
    setUser(null);
    setModalRoute("login");
    setLoading(false);
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    setError(null);

    const result = await resetPasswordAPI(email);

    if (!result.success) {
      setError(result.error || "Reset password failed");
      // Keep the reset password modal open on errors
      setModalRoute("reset-password");
    }

    setLoading(false);
    return result;
  };

  const deleteAccount = async () => {
    setLoading(true);
    setError(null);

    const result = await deleteAccountAPI();

    if (result.success) {
      setUser(null);
      setModalRoute("login");
    } else {
      setError(result.error || "Delete account failed");
      // Keep the delete account modal open on errors
      setModalRoute("delete-user");
    }

    setLoading(false);
  };

  const signInWithApple = async () => {
    setLoading(true);
    setError(null);

    const result = await signInWithAppleAPI();

    if (result.success && result.data) {
      // Supabase auth state change will handle setting the user
      setModalRoute(null);
    } else {
      setError(result.error || "Apple Sign In failed");
      // Keep the login modal open on Apple Sign In errors
      setModalRoute("login");
    }

    setLoading(false);
    return result;
  };

  const showModal = (route: AuthModal) => {
    setModalRoute(route);
  };

  const hideModal = () => {
    setModalRoute(null);
  };

  const markOnboardingComplete = () => {
    setShouldShowOnboarding(false);
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    profileCompletionChecked,
    shouldShowOnboarding,
    login,
    signup,
    logout,
    resetPassword,
    deleteAccount,
    signInWithApple,
    showModal,
    hideModal,
    markOnboardingComplete,
  };
};
