import { CdButton, CdText } from "@/shared/components/CadenceUI";
import { COLORS } from "@/shared/constants/COLORS";
import { TYPOGRAPHY } from "@/shared/constants/TYPOGRAPHY";
import { useToast } from "@/shared/hooks";
import { useI18n } from "@/shared/hooks/useI18n";
import { useSignUp } from "@clerk/clerk-expo";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Keyboard,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { handleAuthError, parseClerkErrors } from "../../utils";
import { styles } from "../style";

interface EmailVerificationProps {
  code: string;
  setCode: (code: string) => void;
  onVerificationSuccess?: () => void;
  onBackToSignUp?: () => void;
  userEmail?: string;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({
  code,
  setCode,
  onVerificationSuccess,
  userEmail,
}) => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const { toast, showError, showSuccess, hideToast } = useToast();
  const { t } = useI18n();

  // Keyboard visibility listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => setIsKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
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

  // Handle resending verification code
  const onResendPress = async () => {
    if (!isLoaded || isResending || resendCooldown > 0) return;

    setIsResending(true);
    setVerificationError(null);

    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      showSuccess(t("verification-code-sent-check-your-email"));
      setResendCooldown(60); // 60 second cooldown
    } catch (err) {
      handleAuthError(err, "EMAIL_VERIFICATION_RESEND", {
        userEmail: userEmail,
        operation: "resend_verification_code",
      });
      const parsedError = parseClerkErrors(err);
      if (parsedError.toastMessage) {
        showError(parsedError.toastMessage);
      }
    } finally {
      setIsResending(false);
    }
  };

  // Handle submission of verification form
  const onVerifyPress = useCallback(async () => {
    if (!isLoaded || !code.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setVerificationError(null);

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code: code.trim(),
      });

      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        showSuccess(t("account-verified-successfully-welcome"));

        // Call the success callback if provided
        if (onVerificationSuccess) {
          onVerificationSuccess();
        }
      } else {
        handleAuthError(
          new Error(t("verification-incomplete")),
          "EMAIL_VERIFICATION_INCOMPLETE",
          {
            userEmail: userEmail,
            signUpStatus: signUpAttempt.status,
            operation: "verify_email_code",
          }
        );
        setVerificationError(t("verification-incomplete-please-try-again"));
        showError(t("verification-incomplete-please-try-again"));
      }
    } catch (err) {
      handleAuthError(err, "EMAIL_VERIFICATION_ATTEMPT", {
        userEmail: userEmail,
        code: code,
        operation: "verify_email_code",
      });

      // Parse Clerk errors using utility function
      const parsedError = parseClerkErrors(err);

      // Set field error for the verification code input
      let errorMessage = t("invalid-verification-code-please-try-again");

      if (parsedError.fieldErrors.general) {
        errorMessage = parsedError.fieldErrors.general;
      } else if (parsedError.generalError) {
        errorMessage = parsedError.generalError;
      } else if (parsedError.toastMessage) {
        errorMessage = parsedError.toastMessage;
      }

      setVerificationError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isLoaded,
    code,
    isSubmitting,
    signUp,
    setActive,
    showSuccess,
    onVerificationSuccess,
    showError,
  ]);

  const inputRef = useRef<TextInput>(null);

  return (
    <>
      <View style={localStyles.container}>
        <CdText variant="title" size="large" style={styles.titleLarge}>
          {t("enter-6-digit-code-from-your-email")}
        </CdText>

        {/* Code Input Label */}
        <CdText variant="body" size="medium" style={localStyles.codeLabel}>
          {t("code")}
        </CdText>

        {/* Custom 6-digit code input with underlines */}
        <View style={localStyles.codeInputContainer}>
          {/* Hidden TextInput for actual input */}
          <TextInput
            ref={inputRef}
            value={code}
            onChangeText={(newCode) => {
              // Only allow numbers and limit to 6 digits
              const numericCode = newCode.replace(/[^0-9]/g, "").slice(0, 6);
              setCode(numericCode);
              // Clear error when user starts typing
              if (verificationError) {
                setVerificationError(null);
              }
              // Auto-submit when code is complete
              if (numericCode.length === 6 && !isSubmitting) {
                // Small delay to allow UI to update
                setTimeout(() => {
                  onVerifyPress();
                }, 100);
              }
            }}
            keyboardType="number-pad"
            maxLength={6}
            style={localStyles.hiddenInput}
            autoFocus={true}
            returnKeyType="done"
            onSubmitEditing={onVerifyPress}
          />

          {/* Visual representation with 6 underlines */}
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <TouchableOpacity
              key={index}
              onPress={() => inputRef.current?.focus()}
              style={localStyles.digitContainer}
            >
              <CdText
                variant="title"
                size="large"
                style={localStyles.digitText}
              >
                {code[index] || ""}
              </CdText>
              <View style={localStyles.underline} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Error message */}
        {verificationError && (
          <CdText variant="body" size="small" style={localStyles.errorText}>
            {verificationError}
          </CdText>
        )}

        {/* Resend code section - single line */}
        <View style={localStyles.resendRow}>
          <CdText variant="body" size="small" style={localStyles.resendText}>
            {t("didnt-receive-the-code")}{" "}
          </CdText>
          <TouchableOpacity
            onPress={onResendPress}
            disabled={isResending || resendCooldown > 0}
            style={
              isResending || resendCooldown > 0 ? { opacity: 0.5 } : undefined
            }
          >
            <CdText variant="link" size="small" style={localStyles.resendLink}>
              {(() => {
                if (isResending) {
                  return t("sending");
                }
                if (resendCooldown > 0) {
                  return t("resend-in-resendcooldown-s").replace(
                    "{0}",
                    resendCooldown.toString()
                  );
                }
                return t("resend-code");
              })()}
            </CdText>
          </TouchableOpacity>
        </View>

        {/* Confirm button - full width, outline style */}
        <CdButton
          title={isSubmitting ? t("verifying") : t("confirm")}
          onPress={onVerifyPress}
          variant="outline"
          size="medium"
          disabled={isSubmitting || code.length !== 6}
          style={localStyles.confirmButton}
        />
      </View>
    </>
  );
};

export default EmailVerification;

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
  },
  codeLabel: {
    color: COLORS.light.ui.border,
    marginBottom: 8,
    marginTop: 24,
  },
  codeInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 24,
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    width: 1,
    height: 1,
  },
  digitContainer: {
    alignItems: "center",
    width: 40,
  },
  digitText: {
    fontSize: 32,
    color: COLORS.neutral.white,
    textAlign: "center",
    height: 40,
    lineHeight: 40,
  },
  underline: {
    width: 20,
    height: 1,
    backgroundColor: COLORS.neutral.white,
    marginTop: 4,
  },
  errorText: {
    color: COLORS.semantic.error,
    marginBottom: 12,
  },
  resendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 24,
    marginTop: 24,
  },
  resendText: {
    color: COLORS.neutral.white,
    fontSize: TYPOGRAPHY.body.small.fontSize,
  },
  resendLink: {
    textDecorationLine: "underline",
    color: COLORS.neutral.white,
    fontSize: TYPOGRAPHY.body.small.fontSize,
  },
  confirmButton: {
    width: "100%",
    marginTop: 16,
  },
});
