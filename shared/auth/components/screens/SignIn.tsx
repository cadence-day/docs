import { CdButton, CdText, CdTextInput } from "@/shared/components/CadenceUI";
import Toast from "@/shared/components/Toast";
import SageIcon from "@/shared/components/icons/SageIcon";
import { useToast } from "@/shared/hooks";
import { useSignIn, useSSO } from "@clerk/clerk-expo";
import { OAuthStrategy } from "@clerk/types";
import * as AuthSession from "expo-auth-session";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect, useRef, useState } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";
import {
  clearAllClerkErrors,
  createClerkErrorClearer,
  handleAuthError,
  handleAuthWarning,
  isValidEmail,
  parseClerkErrors,
  validateEmailField,
  type ClerkErrorMapping,
} from "../../utils";
import DirectToSignUp from "../shared/DirectToSignUp";
import { styles } from "../style";

import { COLORS } from "@/shared/constants/COLORS";
import { useI18n } from "@/shared/hooks/useI18n";

export const useWarmUpBrowser = () => {
  useEffect(() => {
    // Preloads the browser for Android devices to reduce authentication load time
    // See: https://docs.expo.dev/guides/authentication/#improving-user-experience
    void WebBrowser.warmUpAsync();

    return () => {
      // Cleanup: closes browser when component unmounts
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

const SignInScreen = () => {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form validation states
  const [errors, setErrors] = useState({
    email: null as string | null,
    password: null as string | null,
  });

  const [fieldTouched, setFieldTouched] = useState({
    email: false,
    password: false,
  });

  // Clerk server errors state
  const [clerkErrors, setClerkErrors] = useState<ClerkErrorMapping>({
    email: null,
    firstName: null,
    lastName: null,
    password: null,
    general: null,
  });

  const { isLoaded, signIn, setActive } = useSignIn();
  const { startSSOFlow } = useSSO();
  const { toast, showError, showSuccess, hideToast } = useToast();

  useWarmUpBrowser();

  // Input refs for keyboard navigation
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  // Clear Clerk errors when user starts typing
  const clearClerkError = createClerkErrorClearer(setClerkErrors);

  // Validation functions for SignIn
  const validatePasswordSignIn = (password: string): string | null => {
    if (password.length === 0) return t("sign-in.password_required");
    return null;
  };

  // Check if form is valid
  const isFormValid = () => {
    return isValidEmail(email) && password.length > 0;
  };

  // Handle field validation on blur
  const handleFieldBlur = (field: keyof typeof fieldTouched) => {
    setFieldTouched((prev) => ({ ...prev, [field]: true }));

    let error: string | null = null;
    switch (field) {
      case "email":
        error = validateEmailField(email);
        break;
      case "password":
        error = validatePasswordSignIn(password);
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  // Real-time validation for touched fields
  useEffect(() => {
    if (fieldTouched.email) {
      setErrors((prev) => ({ ...prev, email: validateEmailField(email) }));
    }
  }, [email, fieldTouched.email]);

  useEffect(() => {
    if (fieldTouched.password) {
      setErrors((prev) => ({
        ...prev,
        password: validatePasswordSignIn(password),
      }));
    }
  }, [password, fieldTouched.password]);

  // Handle any pending authentication sessions
  WebBrowser.maybeCompleteAuthSession();

  // Handle submission of sign-in form
  const handleSubmit = async () => {
    if (!isLoaded || !isFormValid()) return;

    setIsSubmitting(true);
    // Clear all Clerk errors before attempting signin
    clearAllClerkErrors(setClerkErrors);

    try {
      const signInAttempt = await signIn.create({
        identifier: email,
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        showSuccess(t("sign-in.welcome-back-signed-in-successfully"));
      } else {
        // Handle cases where additional verification might be needed
        handleAuthWarning(
          t("sign-in.sign-in-incomplete-additional-verification-may-be-needed"),
          "SIGNIN_INCOMPLETE",
          { signInStatus: signInAttempt.status }
        );
        showError(t("sign-in.sign-in-incomplete-please-try-again"));
      }
    } catch (err) {
      handleAuthError(err, "SIGNIN_ATTEMPT", {
        email: email,
        hasPassword: !!password,
      });

      // Parse Clerk errors using utility function
      const parsedError = parseClerkErrors(err);
      setClerkErrors(parsedError.fieldErrors);

      // Show toast notification for the error
      if (parsedError.toastMessage) {
        showError(parsedError.toastMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    router.push("/forgot-password");
  };

  const onPress = useCallback(
    async (strategy: string) => {
      try {
        const { createdSessionId, setActive, signIn, signUp } =
          await startSSOFlow({
            strategy: strategy as OAuthStrategy,
            // Use the app's custom scheme and the `/clerk` callback route
            redirectUrl: AuthSession.makeRedirectUri({
              scheme: "day.cadence",
              path: "clerk",
            }),
          });

        if (createdSessionId) {
          setActive!({ session: createdSessionId });
          showSuccess(t("sign-in.signed-in-successfully-0"));
        }
      } catch (err) {
        handleAuthError(err, "SSO_SIGNIN", {
          strategy: strategy,
          redirectUrl: "day.cadence/clerk",
        });

        // Parse Clerk errors for SSO
        const parsedError = parseClerkErrors(err);
        if (parsedError.toastMessage) {
          showError(parsedError.toastMessage);
        } else {
          showError(
            t("sign-in.failed-to-sign-in-with-social-provider-please-try-again")
          );
        }
      }
    },
    [startSSOFlow, showError, showSuccess]
  );

  return (
    <LinearGradient
      colors={[COLORS.linearGradient.start, COLORS.linearGradient.end]}
      locations={[0, 0.6]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.content}>
        <CdText variant="title" size="large" style={styles.title}>
          {t("sign-in.welcome-back")}
        </CdText>

        <CdTextInput
          ref={emailRef}
          placeholder={t("sign-in.email")}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            clearClerkError("email");
          }}
          onBlur={() => handleFieldBlur("email")}
          error={
            clerkErrors.email ||
            (fieldTouched.email && email.length >= 0 ? errors.email : null)
          }
          keyboardType="email-address"
          textContentType="emailAddress"
          autoComplete="email"
          autoCapitalize="none"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
        />

        <CdTextInput
          ref={passwordRef}
          placeholder={t("sign-in.password")}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            clearClerkError("password");
          }}
          onBlur={() => handleFieldBlur("password")}
          error={
            clerkErrors.password ||
            (fieldTouched.password && password.length >= 0
              ? errors.password
              : null)
          }
          isPassword={true}
          textContentType="password"
          autoComplete="password"
          autoCapitalize="none"
          returnKeyType="done"
          importantForAutofill="yes"
          onSubmitEditing={handleSubmit}
        />

        <TouchableOpacity
          onPress={handleForgotPassword}
          style={styles.forgotPasswordContainer}
        >
          <CdText
            variant="link"
            size="medium"
            style={styles.forgotPasswordText}
          >
            {t("sign-in.forgot-password")}
          </CdText>
        </TouchableOpacity>

        <View style={styles.socialContainer}>
          <CdButton
            title={t("sign-in.log-in-with-google")}
            onPress={() => onPress("oauth_google")}
            variant="outline"
            size="medium"
            style={styles.socialButton}
          />
          <CdButton
            title={t("sign-in.log-in-with-apple")}
            onPress={() => onPress("oauth_apple")}
            variant="outline"
            size="medium"
            style={styles.socialButton}
          />
        </View>

        <DirectToSignUp />

        <View style={styles.actionButtonContainer}>
          {isSubmitting ? (
            // TODO: Change this because it appears on the buttons with no overlay...
            <View style={styles.centerContent}>
              <SageIcon status="pulsating" size={100} />
            </View>
          ) : (
            <CdButton
              title={t("sign-in.title")}
              onPress={handleSubmit}
              variant="text"
              size="large"
              disabled={!isFormValid() || isSubmitting}
              style={styles.signinButton}
            />
          )}
        </View>
      </View>

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onHide={hideToast}
      />
    </LinearGradient>
  );
};

export default SignInScreen;
