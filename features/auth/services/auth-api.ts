import { supabase } from "@/shared/utils/supabase";
import { AuthResponse, AuthUser, LoginForm, SignupForm } from "../utils/types";
import { resetAppState } from "@/shared/utils/app-reset";

export const loginAPI = async (
  email: string,
  password: string,
): Promise<AuthResponse<AuthUser>> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.session) {
      const user: AuthUser = {
        id: data.user.id,
        name: data.user.user_metadata?.full_name || data.user.email || "",
        email: data.user.email || "",
        avatar_url: data.user.user_metadata?.avatar_url,
        created_at: data.user.created_at,
        last_sign_in_at: data.user.last_sign_in_at,
      };
      return { success: true, data: user };
    }

    return { success: false, error: "Login failed" };
  } catch (error: any) {
    return { success: false, error: error.message || "Login failed" };
  }
};

export const signupAPI = async (
  formData: SignupForm,
): Promise<AuthResponse<AuthUser>> => {
  try {
    console.log("Starting signup process...");
    console.log("Form data:", formData);
    const { data, error } = await supabase.auth.signUp({
      email: formData.email.toLowerCase().trim(),
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName.trim(),
          agree_to_terms: formData.agreeToTerms,
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.user) {
      console.log("Signup successful:", data.user);
      console.log("Email confirmed:", data.user.email_confirmed_at);
      console.log("Session exists:", !!data.session);

      // Create AuthUser object from Supabase user data
      const user: AuthUser = {
        id: data.user.id,
        name: formData.fullName.trim(),
        email: data.user.email || "",
        avatar_url: data.user.user_metadata?.avatar_url,
        created_at: data.user.created_at,
        last_sign_in_at: data.user.last_sign_in_at,
      };

      // If user has a session, they're automatically confirmed (like in dev mode)
      if (data.session) {
        console.log("User automatically confirmed with session");
        return { success: true, data: user };
      }

      // If no session, user needs to confirm email
      console.log("User needs to confirm email");
      return {
        success: true,
        data: user,
        // Add a flag to indicate email confirmation needed
        needsEmailConfirmation: true,
      };
    }

    return { success: false, error: "Signup failed" };
  } catch (error: any) {
    return { success: false, error: error.message || "Signup failed" };
  }
};

export const logoutAPI = async (): Promise<void> => {
  try {
    console.log("Starting logout process...");

    // 1. Sign out from Supabase auth
    await supabase.auth.signOut();
    console.log("Signed out from Supabase");

    // 2. Reset all application state (AsyncStorage, Zustand stores, notifications)
    const resetSuccess = await resetAppState();
    if (resetSuccess) {
      console.log("App state reset completed successfully");
    } else {
      console.warn("App state reset completed with some errors");
    }

    console.log("Logout process completed");
  } catch (error) {
    console.error("Error during logout:", error);

    // Still attempt cleanup even if logout fails
    try {
      await resetAppState();
      console.log("Fallback cleanup completed");
    } catch (cleanupError) {
      console.error("Error during fallback cleanup:", cleanupError);
    }
  }
};

export const resetPasswordAPI = async (
  email: string,
): Promise<AuthResponse> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.toLowerCase().trim(),
      // Note: redirectTo is optional for mobile apps
      // The reset link will be handled by the email client
    );

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Reset password failed" };
  }
};

export const deleteAccountAPI = async (): Promise<AuthResponse> => {
  try {
    // Note: Account deletion requires admin privileges or a custom RPC function
    // For now, this is a placeholder that just logs out the user
    // In production, you would need to implement a proper delete account RPC function
    const { data: user } = await supabase.auth.getUser();

    if (!user?.user) {
      return { success: false, error: "No user found" };
    }

    // TODO: Implement proper account deletion
    // This would typically involve:
    // 1. Deleting user data from all tables
    // 2. Calling admin API to delete the auth user
    // 3. Handling cleanup of associated resources

    // For now, just logout the user
    await logoutAPI();
    return {
      success: false,
      error: "Account deletion not yet implemented. Please contact support.",
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Delete account failed" };
  }
};

export const resendConfirmationAPI = async (
  email: string,
): Promise<AuthResponse> => {
  try {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email.toLowerCase().trim(),
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Resend confirmation failed",
    };
  }
};

// Re-export the Apple Sign In function from the separate module
export { signInWithApple } from "./apple-auth";

export const handleAuthCallbackAPI = async (
  params: {
    access_token: string;
    refresh_token: string;
    expires_at?: string;
    expires_in?: string;
    token_type?: string;
  },
): Promise<AuthResponse<AuthUser>> => {
  try {
    console.log("=== handleAuthCallbackAPI START ===");
    console.log("Setting session with params:", {
      access_token: params.access_token
        ? `${params.access_token.substring(0, 20)}...`
        : "missing",
      refresh_token: params.refresh_token
        ? `${params.refresh_token.substring(0, 20)}...`
        : "missing",
      expires_at: params.expires_at,
      expires_in: params.expires_in,
      token_type: params.token_type,
    });

    const { data, error } = await supabase.auth.setSession({
      access_token: params.access_token,
      refresh_token: params.refresh_token,
    });

    if (error) {
      console.error("=== Supabase setSession ERROR ===");
      console.error("Error details:", error);
      return { success: false, error: error.message };
    }

    console.log("=== Supabase setSession SUCCESS ===");
    console.log("Session data:", {
      hasSession: !!data.session,
      hasUser: !!data.user,
      userId: data.user?.id,
      userEmail: data.user?.email,
      sessionExpires: data.session?.expires_at,
    });

    if (data.session && data.user) {
      const user: AuthUser = {
        id: data.user.id,
        name: data.user.user_metadata?.full_name || data.user.email || "",
        email: data.user.email || "",
        avatar_url: data.user.user_metadata?.avatar_url,
        created_at: data.user.created_at,
        last_sign_in_at: data.user.last_sign_in_at,
      };

      console.log("=== Created AuthUser ===");
      console.log("User object:", user);

      return { success: true, data: user };
    }

    console.error("=== Session/User Missing ===");
    return { success: false, error: "Failed to establish session" };
  } catch (error: any) {
    console.error("=== handleAuthCallbackAPI EXCEPTION ===");
    console.error("Exception details:", error);
    return { success: false, error: error.message || "Auth callback failed" };
  }
};
