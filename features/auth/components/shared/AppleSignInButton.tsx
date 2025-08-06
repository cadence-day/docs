import React, { useState, useEffect } from "react";
import {
  Platform,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { Ionicons } from "@expo/vector-icons";
// DISABLED FOR NEXT BUILD - SENTRY INTEGRATION
// import * as Sentry from "@sentry/react-native";
import { signInWithApple } from "../../services/auth-api";
import { useAuthErrorHandler } from "../../utils/errorHandler";

interface AppleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  style?: any;
  disabled?: boolean;
}

const AppleSignInButton: React.FC<AppleSignInButtonProps> = ({
  onSuccess,
  onError,
  style,
  disabled = false,
}) => {
  const { showAuthError } = useAuthErrorHandler();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check Apple Authentication availability on mount
    if (Platform.OS === "ios") {
      AppleAuthentication.isAvailableAsync()
        .then((available) => {
          // Sentry.addBreadcrumb({
          //   message: "Apple Authentication availability checked",
          //   category: "auth",
          //   level: "info",
          //   data: { available },
          // });
        })
        .catch((error) => {
          // Sentry.captureException(error, {
          //   tags: {
          //     component: "AppleSignInButton",
          //     action: "checkAvailability",
          //   },
          // });
        });
    }
  }, [isLoading, disabled]);

  const handleAppleSignIn = async () => {
    if (isLoading) {
      // Sentry.addBreadcrumb({
      //   message: "Apple Sign In button press ignored - already loading",
      //   category: "auth",
      //   level: "info",
      // });
      return;
    }

    // Sentry.addBreadcrumb({
    //   message: "Apple Sign In button pressed",
    //   category: "auth",
    //   level: "info",
    // });

    setIsLoading(true);

    try {
      // Sentry.addBreadcrumb({
      //   message: "Calling signInWithApple service",
      //   category: "auth",
      //   level: "info",
      // });

      const result = await signInWithApple();

      // Sentry.addBreadcrumb({
      //   message: "signInWithApple completed",
      //   category: "auth",
      //   level: "info",
      //   data: {
      //     success: result.success,
      //     hasError: !!result.error,
      //     hasData: !!result.data,
      //   },
      // });

      if (result.success) {
        // Sentry.addBreadcrumb({
        //   message: "Apple Sign In successful",
        //   category: "auth",
        //   level: "info",
        // });
        // Supabase auth state change will handle setting the user
        onSuccess?.();
      } else {
        // Handle user cancellation silently (don't show error)
        if (result.error === "CANCELED") {
          // Sentry.addBreadcrumb({
          //   message: "Apple Sign In canceled by user",
          //   category: "auth",
          //   level: "info",
          // });
          return;
        }

        // Sentry.captureMessage("Apple Sign In failed", {
        //   level: "warning",
        //   tags: {
        //     component: "AppleSignInButton",
        //     action: "handleAppleSignIn",
        //   },
        //   extra: {
        //     error: result.error,
        //   },
        // });

        // For other errors, show them to the user
        const processedError = showAuthError(
          result.error || "Apple Sign In failed",
          "apple_sign_in_error",
          "Apple Sign In Error"
        );

        // Sentry.addBreadcrumb({
        //   message: "Apple Sign In error processed for user display",
        //   category: "auth",
        //   level: "info",
        //   data: {
        //     processedMessage: processedError.message,
        //   },
        // });

        onError?.(processedError.message);
      }
    } catch (error: any) {
      // Sentry.captureException(error, {
      //   tags: {
      //     component: "AppleSignInButton",
      //     action: "handleAppleSignIn",
      //   },
      //   extra: {
      //     context: "Unexpected error in Apple Sign In flow",
      //   },
      // });

      // Handle unexpected errors (should be rare with improved signInWithApple function)
      const processedError = showAuthError(
        error,
        "apple_sign_in_unexpected_error",
        "Apple Sign In Error"
      );

      // Sentry.addBreadcrumb({
      //   message: "Unexpected Apple Sign In error processed for user display",
      //   category: "auth",
      //   level: "error",
      //   data: {
      //     processedMessage: processedError.message,
      //   },
      // });

      onError?.(processedError.message);
    } finally {
      // Sentry.addBreadcrumb({
      //   message: "Apple Sign In flow completed, setting loading to false",
      //   category: "auth",
      //   level: "info",
      // });
      setIsLoading(false);
    }
  };

  // Only render on iOS
  if (Platform.OS !== "ios") {
    // Sentry.addBreadcrumb({
    //   message: "AppleSignInButton not rendered - not on iOS platform",
    //   category: "auth",
    //   level: "info",
    //   data: { platform: Platform.OS },
    // });
    return null;
  }

  return (
    <TouchableOpacity
      style={[
        styles.customAppleButton,
        style,
        (disabled || isLoading) && styles.customAppleButtonDisabled,
      ]}
      onPress={() => {
        // Sentry.addBreadcrumb({
        //   message: "Apple Sign In button physically pressed",
        //   category: "auth",
        //   level: "info",
        //   data: {
        //     disabled,
        //     isLoading,
        //     canProceed: !disabled && !isLoading,
        //   },
        // });

        if (!disabled && !isLoading) {
          handleAppleSignIn();
        } else {
          // Sentry.addBreadcrumb({
          //   message:
          //     "Apple Sign In button press ignored due to disabled or loading state",
          //   category: "auth",
          //   level: "info",
          //   data: { disabled, isLoading },
          // });
        }
      }}
      disabled={disabled || isLoading}>
      <View style={styles.buttonContent}>
        {isLoading ? (
          <ActivityIndicator
            size="small"
            color="#FFFFFF"
            style={styles.loadingIcon}
          />
        ) : (
          <Ionicons
            name="logo-apple"
            size={18}
            color="#FFFFFF"
            style={styles.appleIcon}
          />
        )}
        <Text style={styles.buttonText}>
          {isLoading ? "Signing in..." : "Continue with Apple"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  customAppleButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: "100%",
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  customAppleButtonDisabled: {
    borderColor: "#666666",
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  appleIcon: {
    marginRight: 8,
  },
  loadingIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default AppleSignInButton;
