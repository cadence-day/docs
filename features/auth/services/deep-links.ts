import * as Linking from "expo-linking";
import { supabase } from "@/shared/utils/supabase";
import { AuthResponse, AuthUser, DeepLinkParams } from "../utils/types";
import { DEEP_LINK_TYPES } from "../utils/constants";
import { handleAuthCallbackAPI } from "./auth-api";

export const parseDeepLinkUrl = (url: string): DeepLinkParams => {
  try {
    console.log("Parsing deep link URL:", url);

    // Handle Expo development URLs which might have different format
    // Example: exp://192.168.1.27:8081/--/auth-callback#access_token=...
    if (url.startsWith("exp://")) {
      // For Expo URLs, we need to handle the fragment part manually
      let params: DeepLinkParams = {};

      // Check for fragment parameters (after #)
      if (url.includes("#")) {
        const fragmentPart = url.split("#")[1];
        if (fragmentPart) {
          const fragmentParams = new URLSearchParams(fragmentPart);
          for (const [key, value] of fragmentParams.entries()) {
            params[key] = value;
          }
        }
      }

      // Also check for query parameters (after ?)
      if (url.includes("?")) {
        const queryPart = url.split("?")[1];
        if (queryPart) {
          // Remove fragment part if it exists
          const cleanQueryPart = queryPart.split("#")[0];
          const queryParams = new URLSearchParams(cleanQueryPart);
          for (const [key, value] of queryParams.entries()) {
            params[key] = value;
          }
        }
      }

      console.log("Parsed Expo URL params:", params);
      return params;
    }

    // For regular URLs, use the standard parsing
    const parsed = Linking.parse(url);
    let params: DeepLinkParams = (parsed.queryParams as DeepLinkParams) || {};

    // Also check for parameters in the fragment/hash (after #)
    // This handles OAuth redirect URLs like: http://localhost:3000/#access_token=...&refresh_token=...
    if (url.includes("#")) {
      const fragmentPart = url.split("#")[1];
      if (fragmentPart) {
        const fragmentParams = new URLSearchParams(fragmentPart);
        const fragmentObject: DeepLinkParams = {};

        for (const [key, value] of fragmentParams.entries()) {
          fragmentObject[key] = value;
        }

        // Merge fragment parameters with query parameters, giving priority to fragment
        params = { ...params, ...fragmentObject };
      }
    }

    console.log("Parsed URL params:", params);
    return params;
  } catch (error) {
    console.error("Error parsing deep link URL:", error);
    return {};
  }
};

export const handleLoginCallback = async (
  url: string,
): Promise<AuthResponse<AuthUser>> => {
  try {
    console.log("=== Handling login callback ===");
    console.log("URL:", url);

    const params = parseDeepLinkUrl(url);

    console.log("Parsed callback params:", {
      access_token: params.access_token
        ? `${params.access_token.substring(0, 20)}...`
        : "missing",
      refresh_token: params.refresh_token
        ? `${params.refresh_token.substring(0, 20)}...`
        : "missing",
      expires_at: params.expires_at,
      expires_in: params.expires_in,
      token_type: params.token_type,
      code: params.code ? "present" : "missing",
      error: params.error,
      type: params.type,
    });

    if (params.error) {
      console.error(
        "Auth callback error:",
        params.error,
        params.error_description,
      );
      return {
        success: false,
        error: params.error_description || params.error,
      };
    }

    // Handle OAuth callback with code
    if (params.code) {
      console.log("Processing OAuth callback with authorization code");
      const { data, error } = await supabase.auth.exchangeCodeForSession(
        params.code,
      );
      if (error) {
        console.error("Error exchanging code for session:", error);
        return { success: false, error: error.message };
      }

      if (data.session) {
        console.log("Successfully exchanged code for session");
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
    }

    // Handle direct token callback (common for email auth redirects)
    if (params.access_token && params.refresh_token) {
      console.log("Processing direct token callback");
      const result = await handleAuthCallbackAPI({
        access_token: params.access_token,
        refresh_token: params.refresh_token,
        expires_at: params.expires_at,
        expires_in: params.expires_in,
        token_type: params.token_type,
      });

      if (result.success) {
        console.log("Successfully processed direct token callback");
      } else {
        console.error("Failed to process direct token callback:", result.error);
      }

      return result;
    }

    console.error(
      "Invalid authentication callback - missing required parameters",
    );
    return { success: false, error: "Invalid authentication callback" };
  } catch (error: any) {
    console.error("Error in handleLoginCallback:", error);
    return {
      success: false,
      error: error.message || "Callback handling failed",
    };
  }
};

export const getDeepLinkModalRoute = (url: string): string | null => {
  if (!url) return null;

  const params = parseDeepLinkUrl(url);

  // Check for specific authentication flows
  if (
    params.type === DEEP_LINK_TYPES.RECOVERY ||
    url.includes("reset-password")
  ) {
    return "reset-password";
  }

  if (
    params.type === DEEP_LINK_TYPES.MAGIC_LINK ||
    url.includes("magic-link")
  ) {
    return "magic-link";
  }

  if (url.includes("login")) {
    return "login";
  }

  if (url.includes("signup")) {
    return "signup";
  }

  if (url.includes("otp")) {
    return "otp";
  }

  // If it's a successful authentication with tokens, don't show modal
  if (params.access_token || params.code || url.includes("confirmed")) {
    return null;
  }

  return null;
};

export const setupDeepLinkListener = (
  onAuthCallback: (result: AuthResponse<AuthUser>) => void,
  onModalRoute: (route: string | null) => void,
) => {
  const processedUrls = new Set<string>(); // Track processed URLs to prevent duplicates

  const handleUrl = async ({ url }: { url: string }) => {
    if (!url) return;

    // Prevent processing the same URL multiple times
    if (processedUrls.has(url)) {
      console.log("URL already processed, skipping:", url);
      return;
    }
    processedUrls.add(url);

    // Filter out non-auth URLs to prevent infinite loops
    // Allow Expo development URLs with auth parameters, but ignore others
    if (
      url.startsWith("file://") ||
      url.includes("metro") ||
      (url.startsWith("exp://") && !url.includes("access_token") &&
        !url.includes("code=") && !url.includes("error=") &&
        !url.includes("#")) ||
      (url.startsWith("http://localhost") && !url.includes("access_token") &&
        !url.includes("code=") && !url.includes("error=") &&
        !url.includes("#")) ||
      (!url.includes("auth") &&
        !url.includes("login") &&
        !url.includes("signup") &&
        !url.includes("reset-password") &&
        !url.includes("magic-link") &&
        !url.includes("otp") &&
        !url.includes("access_token") &&
        !url.includes("code=") &&
        !url.includes("error=") &&
        !url.includes("confirmed"))
    ) {
      console.log("Ignoring non-auth deep link:", url);
      return;
    }

    console.log("Handling auth deep link:", url);

    // Check if it's an auth callback
    const params = parseDeepLinkUrl(url);
    if (params.access_token || params.code || params.error) {
      const result = await handleLoginCallback(url);
      onAuthCallback(result);
      return;
    }

    // Otherwise, determine modal route
    const modalRoute = getDeepLinkModalRoute(url);
    onModalRoute(modalRoute);
  };

  // Handle current URL if app was opened with a deep link
  Linking.getInitialURL().then((url) => {
    if (url) {
      handleUrl({ url });
    }
  });

  // Listen for future deep links
  const subscription = Linking.addEventListener("url", handleUrl);

  return () => subscription.remove();
};

/**
 * Utility function to create a proper deep link URL for testing
 * Converts auth callback parameters to appropriate URL format
 */
export const createAuthDeepLink = (params: {
  access_token?: string;
  refresh_token?: string;
  expires_at?: string;
  expires_in?: string;
  token_type?: string;
  type?: string;
  error?: string;
  error_description?: string;
}, baseUrl: string = "exp://192.168.1.27:8081"): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.append(key, value);
    }
  });

  // For Expo URLs, append the auth callback path and fragment
  if (baseUrl.startsWith("exp://")) {
    return `${baseUrl}/--/auth-callback#${searchParams.toString()}`;
  }

  // For regular URLs, use fragment
  return `${baseUrl}#${searchParams.toString()}`;
};
