import CdButton from "@/shared/components/CdButton";
import CdText from "@/shared/components/CdText";
import CdTextInput from "@/shared/components/CdTextInput";
import Toast from "@/shared/components/Toast";
import { useToast } from "@/shared/hooks";
import { useSignUp } from "@clerk/clerk-expo";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { parseClerkErrors } from "../../utils";
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
  onBackToSignUp,
  userEmail,
}) => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(
    null,
  );
  const [resendCooldown, setResendCooldown] = useState(0);
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

  // Handle resending verification code
  const onResendPress = async () => {
    if (!isLoaded || isResending || resendCooldown > 0) return;

    setIsResending(true);
    setVerificationError(null);

    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
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
        showSuccess("Account verified successfully! Welcome!");

        // Call the success callback if provided
        if (onVerificationSuccess) {
          onVerificationSuccess();
        }
      } else {
        console.error(
          "Verification incomplete:",
          JSON.stringify(signUpAttempt, null, 2),
        );
        setVerificationError("Verification incomplete. Please try again.");
        showError("Verification incomplete. Please try again.");
      }
    } catch (err) {
      console.error("Verification error:", JSON.stringify(err, null, 2));

      // Parse Clerk errors using utility function
      const parsedError = parseClerkErrors(err);

      // Set field error for the verification code input
      let errorMessage = "Invalid verification code. Please try again.";

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
        Verify your email
      </CdText>

      <CdText
        variant="body"
        size="medium"
        style={{ color: "#B9B9B9", marginBottom: 20, textAlign: "center" }}
      >
        We've sent a verification code to{" "}
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
        placeholder="Enter 6-digit code"
        returnKeyType="done"
        onSubmitEditing={onVerifyPress}
        maxLength={6}
        style={{ textAlign: "center", fontSize: 18, letterSpacing: 2 }}
      />

      <CdButton
        title={isSubmitting ? "Verifying..." : "Verify Email"}
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
          style={{ color: "#666", marginBottom: 10 }}
        >
          Didn't receive the code?
        </CdText>

        <TouchableOpacity
          onPress={onResendPress}
          disabled={isResending || resendCooldown > 0}
          style={{ opacity: isResending || resendCooldown > 0 ? 0.5 : 1 }}
        >
          <CdText
            variant="body"
            size="medium"
            style={{ color: "#007AFF", fontWeight: "600" }}
          >
            {isResending
              ? "Sending..."
              : resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : "Resend Code"}
          </CdText>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={onBackToSignUp || (() => router.replace("/"))}
        style={{ marginTop: 30 }}
      >
        <CdText variant="body" size="small" style={{ color: "#666" }}>
          ← Back to Sign Up
        </CdText>
      </TouchableOpacity>

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
