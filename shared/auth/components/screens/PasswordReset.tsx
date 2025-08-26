import CdButton from "@/shared/components/CdButton";
import CdText from "@/shared/components/CdText";
import CdTextInput from "@/shared/components/CdTextInput";
import SageIcon from "@/shared/components/icons/SageIcon";
import Toast from "@/shared/components/Toast";
import { COLORS } from "@/shared/constants/COLORS";
import { useToast } from "@/shared/hooks";
import { useSignIn } from "@clerk/clerk-expo";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { parseClerkErrors } from "../../utils";
import { PASSWORD_REQUIREMENTS } from "../../utils/constants";
import PasswordRequirement from "../shared/PasswordRequirement";
import { styles } from "../style";

interface PasswordResetScreenProps {
  email?: string;
}

const PasswordResetScreen: React.FC<PasswordResetScreenProps> = ({ email }) => {
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
  const { toast, showError, showSuccess, hideToast } = useToast();

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
  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < PASSWORD_REQUIREMENTS.MIN_LENGTH) {
      return `Password must be at least ${PASSWORD_REQUIREMENTS.MIN_LENGTH} characters`;
    }
    if (PASSWORD_REQUIREMENTS.REQUIRE_UPPERCASE && !/[A-Z]/.test(pwd)) {
      return "Password must contain at least one uppercase letter";
    }
    if (PASSWORD_REQUIREMENTS.REQUIRE_LOWERCASE && !/[a-z]/.test(pwd)) {
      return "Password must contain at least one lowercase letter";
    }
    if (PASSWORD_REQUIREMENTS.REQUIRE_NUMBER && !/[0-9]/.test(pwd)) {
      return "Password must contain at least one number";
    }
    if (
      PASSWORD_REQUIREMENTS.REQUIRE_SPECIAL_CHAR &&
      !/[!@#$%^&*()_+\-=[\]{};':"\\|<>?,./`~]/.test(pwd)
    ) {
      return "Password must contain at least one special character";
    }
    return null;
  };

  // Check if passwords match
  const validatePasswordMatch = (
    pwd: string,
    repeatPwd: string
  ): string | null => {
    if (pwd !== repeatPwd && repeatPwd.length > 0) {
      return "Passwords do not match";
    }
    return null;
  };

  // Check if all password requirements are met
  const isPasswordValid = (): boolean => {
    return (
      validatePassword(password) === null &&
      validatePasswordMatch(password, repeatPassword) === null &&
      password.length > 0 &&
      repeatPassword.length > 0
    );
  };

  // Handle resending verification code
  const onResendPress = async () => {
    if (!isLoaded || !signIn || isResending || resendCooldown > 0 || !email)
      return;

    setIsResending(true);
    setCodeError(null);

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        emailAddressId: email,
      });
      showSuccess("Verification code sent! Check your email.");
      setResendCooldown(60); // 60 second cooldown
    } catch (err) {
      console.error("Resend error:", JSON.stringify(err, null, 2));
      const parsedError = parseClerkErrors(err);
      if (parsedError.toastMessage) {
        showError(parsedError.toastMessage);
      }
    } finally {
      setIsResending(false);
    }
  };

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
        showSuccess("Code verified! Please set your new password.");
      } else {
        console.error(
          "Unexpected status:",
          JSON.stringify(signInAttempt, null, 2)
        );
        setCodeError("Verification incomplete. Please try again.");
        showError("Verification incomplete. Please try again.");
      }
    } catch (err) {
      console.error("Code verification error:", JSON.stringify(err, null, 2));
      const parsedError = parseClerkErrors(err);

      let errorMessage = "Invalid verification code. Please try again.";
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
  }, [isLoaded, signIn, code, isSubmitting, showSuccess, showError]);

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
        showSuccess("Password reset successfully!");
        // Navigate to main app or show success
        setTimeout(() => {
          router.replace("/(home)");
        }, 2000);
      } else {
        console.error(
          "Password reset incomplete:",
          JSON.stringify(signInAttempt, null, 2)
        );
        setPasswordError("Password reset incomplete. Please try again.");
        showError("Password reset incomplete. Please try again.");
      }
    } catch (err) {
      console.error("Password reset error:", JSON.stringify(err, null, 2));
      const parsedError = parseClerkErrors(err);

      let errorMessage = "Failed to reset password. Please try again.";
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
  ]);

  // Auto-submit code when 6 digits are entered
  useEffect(() => {
    if (step === "code" && code.length === 6 && !isSubmitting) {
      setTimeout(() => {
        onVerifyCodePress();
      }, 100);
    }
  }, [code, step, isSubmitting, onVerifyCodePress]);

  return (
    <LinearGradient
      colors={[COLORS.linearGradient.start, COLORS.linearGradient.end]}
      locations={[0, 0.6]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.form}>
        {isSubmitting ? (
          <View style={styles.centerContent}>
            <SageIcon status="pulsating" size={200} />
          </View>
        ) : (
          <View style={styles.formContainer}>
            {step === "code" ? (
              <>
                <CdText variant="title" size="large" style={styles.title}>
                  Enter Verification Code
                </CdText>

                <CdText
                  variant="body"
                  size="medium"
                  style={{
                    marginBottom: 24,
                    textAlign: "center",
                    color: "#B9B9B9",
                  }}
                >
                  We've sent a 6-digit verification code to{" "}
                  {email && (
                    <CdText
                      variant="body"
                      size="medium"
                      style={{ fontWeight: "600" }}
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
                  placeholder="Enter 6-digit code"
                  returnKeyType="done"
                  onSubmitEditing={onVerifyCodePress}
                  maxLength={6}
                  letterSpacing={2}
                  style={{
                    textAlign: "center",
                    fontSize: 18,
                    color: COLORS.white,
                  }}
                />

                <View style={{ marginTop: 20, alignItems: "center" }}>
                  <CdText
                    variant="body"
                    size="small"
                    style={{ color: COLORS.placeholderText, marginBottom: 10 }}
                  >
                    Didn't receive the code?
                  </CdText>

                  <TouchableOpacity
                    onPress={onResendPress}
                    disabled={isResending || resendCooldown > 0}
                    style={{
                      opacity: isResending || resendCooldown > 0 ? 0.5 : 1,
                    }}
                  >
                    <CdText
                      variant="body"
                      size="medium"
                      style={{ color: COLORS.primary, fontWeight: "600" }}
                    >
                      {isResending
                        ? "Sending..."
                        : resendCooldown > 0
                          ? `Resend in ${resendCooldown}s`
                          : "Resend Code"}
                    </CdText>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <CdText variant="title" size="large" style={styles.title}>
                  Set New Password
                </CdText>

                <CdText
                  variant="body"
                  size="medium"
                  style={{
                    marginBottom: 24,
                    textAlign: "center",
                    color: "#B9B9B9",
                  }}
                >
                  Create a strong password for your account
                </CdText>

                <CdTextInput
                  placeholder="New Password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) {
                      setPasswordError(null);
                    }
                  }}
                  onBlur={() =>
                    setFieldsTouched((prev) => ({ ...prev, password: true }))
                  }
                  error={fieldsTouched.password ? passwordError : null}
                  secureTextEntry
                  textContentType="newPassword"
                  autoComplete="password-new"
                  returnKeyType="next"
                />

                <CdTextInput
                  placeholder="Repeat New Password"
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
              </>
            )}

            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginTop: 20 }}
            >
              <CdText
                variant="link"
                size="medium"
                style={{ textAlign: "center" }}
              >
                ← Back to Sign In
              </CdText>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.actionButtonContainer}>
          {step === "code" ? (
            <CdButton
              title="Verify Code"
              onPress={onVerifyCodePress}
              variant="text"
              size="large"
              disabled={code.length !== 6 || isSubmitting}
            />
          ) : (
            <CdButton
              title="Reset Password"
              onPress={onResetPasswordPress}
              variant="text"
              size="large"
              disabled={!isPasswordValid() || isSubmitting}
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

export default PasswordResetScreen;
