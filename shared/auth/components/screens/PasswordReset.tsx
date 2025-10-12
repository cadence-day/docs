import { CdButton, CdText, CdTextInput } from "@/shared/components/CadenceUI";
import SageIcon from "@/shared/components/icons/SageIcon";
import Toast from "@/shared/components/Toast";
import { COLORS } from "@/shared/constants/COLORS";
import { useToast } from "@/shared/hooks";
import { useI18n } from "@/shared/hooks/useI18n";
import { useSignIn } from "@clerk/clerk-expo";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { handleAuthError, parseClerkErrors } from "../../utils";
import { PASSWORD_REQUIREMENTS } from "../../utils/constants";
import PasswordRequirement from "../shared/PasswordRequirement";
import { styles } from "../style";

interface PasswordResetScreenProps {
  email?: string;
}

const PasswordResetScreen: React.FC<PasswordResetScreenProps> = ({ email }) => {
  const { t } = useI18n();
  const { isLoaded, signIn, setActive } = useSignIn();
  const [step, setStep] = useState<"code" | "password">("code");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [fieldsTouched, setFieldsTouched] = useState({
    code: false,
    password: false,
    repeatPassword: false,
  });
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const { toast, showError, showSuccess, hideToast } = useToast();

  // Keyboard visibility listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setIsKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setIsKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Password validation
  const validatePassword = useCallback(
    (pwd: string): string | null => {
      if (pwd.length < PASSWORD_REQUIREMENTS.MIN_LENGTH) {
        return t(
          "password-reset.password-must-be-at-least-password_requirements-min_length-characters"
        ).replace("{0}", PASSWORD_REQUIREMENTS.MIN_LENGTH.toString());
      }
      if (PASSWORD_REQUIREMENTS.REQUIRE_UPPERCASE && !/[A-Z]/.test(pwd)) {
        return t(
          "password-reset.password-must-contain-at-least-one-uppercase-letter"
        );
      }
      if (PASSWORD_REQUIREMENTS.REQUIRE_LOWERCASE && !/[a-z]/.test(pwd)) {
        return t(
          "password-reset.password-must-contain-at-least-one-lowercase-letter"
        );
      }
      if (PASSWORD_REQUIREMENTS.REQUIRE_NUMBER && !/[0-9]/.test(pwd)) {
        return t("password-reset.password-must-contain-at-least-one-number");
      }
      if (
        PASSWORD_REQUIREMENTS.REQUIRE_SPECIAL_CHAR &&
        !/[!@#$%^&*()_+\-=[\]{};':"\\|<>?,./`~]/.test(pwd)
      ) {
        return t(
          "password-reset.password-must-contain-at-least-one-special-character"
        );
      }
      return null;
    },
    [t]
  );

  // Check if passwords match
  const validatePasswordMatch = useCallback(
    (pwd: string, repeatPwd: string): string | null => {
      if (pwd !== repeatPwd && repeatPwd.length > 0) {
        return t("password-reset.passwords-do-not-match");
      }
      return null;
    },
    [t]
  );

  // Check if all password requirements are met
  const isPasswordValid = useCallback((): boolean => {
    return (
      validatePassword(password) === null &&
      validatePasswordMatch(password, repeatPassword) === null &&
      password.length > 0 &&
      repeatPassword.length > 0
    );
  }, [password, repeatPassword, validatePassword, validatePasswordMatch]);

  // Handle resending verification code
  const onResendPress = useCallback(async () => {
    if (!isLoaded || !signIn || isResending || resendCooldown > 0 || !email)
      return;

    setIsResending(true);
    setCodeError(null);

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        // TODO: Verify if it is not emailAddressId?
        identifier: email,
      });
      showSuccess(t("password-reset.verification-code-sent-check-your-email"));
      setResendCooldown(60); // 60 second cooldown
    } catch (err) {
      handleAuthError(err, "PASSWORD_RESET_RESEND", {
        email: email,
        operation: "resend_reset_code",
      });
      const parsedError = parseClerkErrors(err);
      if (parsedError.toastMessage) {
        showError(parsedError.toastMessage);
      }
    } finally {
      setIsResending(false);
    }
  }, [
    isLoaded,
    signIn,
    isResending,
    resendCooldown,
    email,
    showSuccess,
    showError,
    t,
  ]);

  // Handle verification code submission
  const onVerifyCodePress = useCallback(async () => {
    if (!isLoaded || !signIn || !code.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setCodeError(null);

    try {
      const signInAttempt = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: code.trim(),
      });

      if (signInAttempt.status === "needs_new_password") {
        setStep("password");
        showSuccess(
          t("password-reset.code-verified-please-set-your-new-password")
        );
      } else {
        handleAuthError(
          new Error(t("password-reset.unexpected-verification-status")),
          "PASSWORD_RESET_CODE_VERIFICATION",
          {
            email: email,
            code: code,
            status: signInAttempt.status,
            operation: "verify_reset_code",
          }
        );
        setCodeError(
          t("password-reset.verification-incomplete-please-try-again")
        );
        showError(t("password-reset.verification-incomplete-please-try-again"));
      }
    } catch (err) {
      handleAuthError(err, "PASSWORD_RESET_CODE_ATTEMPT", {
        email: email,
        code: code,
        operation: "attempt_reset_code_verification",
      });
      const parsedError = parseClerkErrors(err);

      let errorMessage = t(
        "password-reset.invalid-verification-code-please-try-again"
      );
      if (parsedError.fieldErrors.general) {
        errorMessage = parsedError.fieldErrors.general;
      } else if (parsedError.generalError) {
        errorMessage = parsedError.generalError;
      } else if (parsedError.toastMessage) {
        errorMessage = parsedError.toastMessage;
      }

      setCodeError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [isLoaded, signIn, code, isSubmitting, showSuccess, showError, t, email]);

  // Handle password reset completion
  const onResetPasswordPress = useCallback(async () => {
    if (!isLoaded || !signIn || !isPasswordValid() || isSubmitting) return;

    const pwdError = validatePassword(password);
    const matchError = validatePasswordMatch(password, repeatPassword);

    if (pwdError || matchError) {
      setPasswordError(pwdError || matchError);
      return;
    }

    setIsSubmitting(true);
    setPasswordError(null);

    try {
      const signInAttempt = await signIn.resetPassword({
        password: password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        showSuccess(t("password-reset.password-reset-successfully"));
        // Navigate to main app or show success
        setTimeout(() => {
          router.replace("/(home)");
        }, 2000);
      } else {
        handleAuthError(
          new Error(t("password-reset.password-reset-incomplete")),
          "PASSWORD_RESET_INCOMPLETE",
          {
            email: email,
            status: signInAttempt.status,
            operation: "complete_password_reset",
          }
        );
        setPasswordError(
          t("password-reset.password-reset-incomplete-please-try-again")
        );
        showError(
          t("password-reset.password-reset-incomplete-please-try-again")
        );
      }
    } catch (err) {
      handleAuthError(err, "PASSWORD_RESET_ATTEMPT", {
        email: email,
        operation: "reset_password_with_new_password",
      });
      const parsedError = parseClerkErrors(err);

      let errorMessage = t(
        "password-reset.failed-to-reset-password-please-try-again"
      );
      if (parsedError.fieldErrors.password) {
        errorMessage = parsedError.fieldErrors.password;
      } else if (parsedError.generalError) {
        errorMessage = parsedError.generalError;
      } else if (parsedError.toastMessage) {
        errorMessage = parsedError.toastMessage;
      }

      setPasswordError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isLoaded,
    signIn,
    isPasswordValid,
    isSubmitting,
    password,
    repeatPassword,
    showSuccess,
    showError,
    t,
    setActive,
    validatePassword,
    validatePasswordMatch,
    email,
  ]);

  // Auto-submit code when 6 digits are entered
  useEffect(() => {
    if (step === "code" && code.length === 6 && !isSubmitting) {
      setTimeout(() => {
        onVerifyCodePress();
      }, 100);
    }
  }, [code, step, isSubmitting, onVerifyCodePress]);

  let resendText = t("password-reset.resend-code");
  if (isResending) {
    resendText = "Sending...";
  } else if (resendCooldown > 0) {
    resendText = t("password-reset.resend-in-resendcooldown-s", {
      seconds: resendCooldown,
    });
  }

  const resendOpacity = isResending || resendCooldown > 0 ? 0.5 : 1;

  return (
    <LinearGradient
      colors={[COLORS.linearGradient.start, COLORS.linearGradient.end]}
      locations={[0, 0.6]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.container}>
        {/* SageIcon at the top - matching onboarding position */}
        {!isSubmitting && !isKeyboardVisible && (
          <View style={styles.topIconContainer}>
            <SageIcon status="pulsating" size={80} auto={false} />
          </View>
        )}

        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={0}
        >
          <View style={styles.container}>

            <View style={styles.form}>
            {isSubmitting ? (
              <View style={styles.centerContent}>
                <SageIcon status="pulsating" size={200} />
              </View>
            ) : (
              <View style={styles.formContainer}>
                {step === "code" ? (
                  <>
                    <CdText
                      variant="body"
                      size="medium"
                      style={localStyles.subtitle}
                    >
                      {t(
                        "password-reset.weve-sent-a-6-digit-verification-code-to"
                      )}{" "}
                      {email && (
                        <CdText
                          variant="body"
                          size="medium"
                          style={localStyles.boldText}
                        >
                          {email}
                        </CdText>
                      )}
                    </CdText>

                    <CdTextInput
                      value={code}
                      onChangeText={(newCode) => {
                        // Only allow numbers and limit to 6 digits
                        const numericCode = newCode
                          .replace(/[^0-9]/g, "")
                          .slice(0, 6);
                        setCode(numericCode);
                        // Clear error when user starts typing
                        if (codeError) {
                          setCodeError(null);
                        }
                      }}
                      onBlur={() =>
                        setFieldsTouched((prev) => ({ ...prev, code: true }))
                      }
                      error={fieldsTouched.code ? codeError : null}
                      keyboardType="number-pad"
                      placeholder={t("password-reset.enter-6-digit-code")}
                      returnKeyType="done"
                      onSubmitEditing={onVerifyCodePress}
                      maxLength={6}
                      letterSpacing={2}
                      style={localStyles.codeInput}
                    />

                    <CdButton
                      title={t("password-reset.verify-code")}
                      onPress={onVerifyCodePress}
                      variant="outline"
                      size="large"
                      disabled={code.length !== 6 || isSubmitting}
                    />

                    <View style={localStyles.resendWrapper}>
                      <CdText
                        variant="body"
                        size="small"
                        style={localStyles.placeholderText}
                      >
                        {t("password-reset.didnt-receive-the-code")}
                      </CdText>

                      <TouchableOpacity
                        onPress={onResendPress}
                        disabled={isResending || resendCooldown > 0}
                        style={[
                          localStyles.resendButton,
                          { opacity: resendOpacity },
                        ]}
                      >
                        <CdText
                          variant="body"
                          size="medium"
                          style={localStyles.resendText}
                        >
                          {resendText}
                        </CdText>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <>
                    <CdText variant="title" size="large" style={styles.titleLarge}>
                      {t("password-reset.set-new-password")}
                    </CdText>

                    <CdText
                      variant="body"
                      size="medium"
                      style={localStyles.subtitle}
                    >
                      {t(
                        "password-reset.create-a-strong-password-for-your-account"
                      )}
                    </CdText>

                    <CdTextInput
                      placeholder={t("password-reset.new-password")}
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        if (passwordError) {
                          setPasswordError(null);
                        }
                      }}
                      onBlur={() =>
                        setFieldsTouched((prev) => ({
                          ...prev,
                          password: true,
                        }))
                      }
                      error={fieldsTouched.password ? passwordError : null}
                      secureTextEntry
                      textContentType="newPassword"
                      autoComplete="password-new"
                      returnKeyType="next"
                    />

                    <CdTextInput
                      placeholder={t("password-reset.repeat-new-password")}
                      value={repeatPassword}
                      onChangeText={(text) => {
                        setRepeatPassword(text);
                        if (passwordError) {
                          setPasswordError(null);
                        }
                      }}
                      onBlur={() =>
                        setFieldsTouched((prev) => ({
                          ...prev,
                          repeatPassword: true,
                        }))
                      }
                      error={
                        fieldsTouched.repeatPassword
                          ? validatePasswordMatch(password, repeatPassword)
                          : null
                      }
                      secureTextEntry
                      textContentType="newPassword"
                      autoComplete="password-new"
                      returnKeyType="done"
                      onSubmitEditing={onResetPasswordPress}
                    />

                    <PasswordRequirement
                      password={password}
                      repeatPassword={repeatPassword}
                    />

                    <CdButton
                      title={t("password-reset.reset-password")}
                      onPress={onResetPasswordPress}
                      variant="outline"
                      size="large"
                      disabled={!isPasswordValid() || isSubmitting}
                    />
                  </>
                )}

                <TouchableOpacity
                  onPress={() => router.back()}
                  style={localStyles.backLinkWrapper}
                >
                  <CdText
                    variant="link"
                    size="medium"
                    style={localStyles.centerText}
                  >
                    {t("password-reset.back-to-sign-in")}
                  </CdText>
                </TouchableOpacity>
              </View>
            )}
          </View>
          </View>
        </KeyboardAvoidingView>

        {/* CADENCE text at the bottom - matching onboarding position */}
        {!isSubmitting && (
          <CdText variant="title" size="large" style={styles.cadenceText}>
            CADENCE
          </CdText>
        )}

        {/* Toast Notification */}
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onHide={hideToast}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

export default PasswordResetScreen;

const localStyles = StyleSheet.create({
  subtitle: {
    marginBottom: 24,
    textAlign: "left",
    color: "#B9B9B9",
  },
  codeInput: {
    textAlign: "center",
    fontSize: 18,
    color: COLORS.white,
  },
  resendWrapper: {
    marginTop: 20,
    alignItems: "center",
  },
  placeholderText: {
    color: COLORS.placeholderText,
    marginBottom: 10,
  },
  resendButton: {},
  resendText: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  backLinkWrapper: {
    marginTop: 20,
  },
  centerText: {
    textAlign: "center",
  },
  boldText: {
    fontWeight: "600",
  },
});
