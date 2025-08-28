import { CdButton, CdText, CdTextInput } from "@/shared/components/CadenceUI";
import Toast from "@/shared/components/Toast";
import { useToast } from "@/shared/hooks";
import { useI18n } from "@/shared/hooks/useI18n";
import { useSignUp } from "@clerk/clerk-expo";
import React, { useCallback, useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { COLORS } from "../../../constants/COLORS";
import { handleAuthError, parseClerkErrors } from "../../utils";
import { styles } from "../style";
import DirectToSignIn from "./DirectToSignIn";

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
  onBackToSignUp,
  userEmail,
}) => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );
  const [resendCooldown, setResendCooldown] = useState(0);
  const { toast, showError, showSuccess, hideToast } = useToast();
  const { t } = useI18n();

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

  return (
    <View style={styles.centerContent}>
      <CdText variant="title" size="large" style={styles.title}>
        {t("verify-your-email")}
      </CdText>

      <CdText
        variant="body"
        size="medium"
        style={{ color: "#B9B9B9", marginBottom: 20, textAlign: "center" }}
      >
        {t("weve-sent-a-verification-code-to")}{" "}
        {userEmail && (
          <CdText variant="body" size="medium" style={{ fontWeight: "600" }}>
            {userEmail}
          </CdText>
        )}
      </CdText>

      <CdTextInput
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
        error={verificationError}
        keyboardType="number-pad"
        placeholder={t("enter-6-digit-code")}
        returnKeyType="done"
        onSubmitEditing={onVerifyPress}
        maxLength={6}
        letterSpacing={2}
        style={{
          textAlign: "center",
          fontSize: 18,
          color: COLORS.white,
        }}
      />

      <CdButton
        title={isSubmitting ? "Verifying..." : t("verify-your-email")}
        onPress={onVerifyPress}
        variant="outline"
        size="medium"
        disabled={isSubmitting || code.length !== 6}
        style={{ width: "100%", marginTop: 20 }}
      />

      <View style={{ marginTop: 20, alignItems: "center" }}>
        <CdText
          variant="body"
          size="small"
          style={{ color: COLORS.placeholderText, marginBottom: 10 }}
        >
          {t("didnt-receive-the-code")}
        </CdText>

        <TouchableOpacity
          onPress={onResendPress}
          disabled={isResending || resendCooldown > 0}
          style={{ opacity: isResending || resendCooldown > 0 ? 0.5 : 1 }}
        >
          <CdText
            variant="body"
            size="medium"
            style={{ color: COLORS.primary, fontWeight: "600" }}
          >
            {isResending
              ? t("sending")
              : resendCooldown > 0
                ? t("resend-in-resendcooldown-s").replace(
                    "{0}",
                    resendCooldown.toString()
                  )
                : t("resend-code")}
          </CdText>
        </TouchableOpacity>
      </View>

      <DirectToSignIn />

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onHide={hideToast}
      />
    </View>
  );
};

export default EmailVerification;
