import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AuthInput from "../shared/AuthInput";
import { useAuthStore } from "../../hooks/useAuthStore";
import { useAuthErrorHandler } from "../../utils/errorHandler";
import AuthDialog from "../shared/AuthDialog";
import { useI18n } from "@/shared/hooks/useI18n";
import authDialogStyles from "../shared/authDialogStyles";
import { resendConfirmationAPI } from "../../services/auth-api";

interface EmailConfirmationDialogProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
  isLoading: boolean;
  userEmail?: string;
}

const EmailConfirmationDialog: React.FC<EmailConfirmationDialogProps> = ({
  onClose,
  onSwitchToLogin,
  isLoading,
  userEmail,
}) => {
  const { t } = useI18n();
  const { showAuthError } = useAuthErrorHandler();
  const [email, setEmail] = useState(userEmail || "");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const { setError, error: authError } = useAuthStore();

  useEffect(() => {
    // Clear auth error when component mounts
    setError(null);
  }, [setError]);

  const handleEmailChange = (value: string) => {
    setEmail(value);

    // Clear error for this field
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: "" }));
    }
  };

  const handleResendConfirmation = async () => {
    if (!email.trim()) {
      setErrors({ email: "Please enter your email address" });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const result = await resendConfirmationAPI(email);

      if (result.success) {
        setIsEmailSent(true);
        setError(null);
      } else {
        const processedError = showAuthError(
          result.error,
          "resend_confirmation",
          "Resend Confirmation Error",
          { email }
        );
        setError(processedError.message);
      }
    } catch (error: any) {
      const processedError = showAuthError(
        error,
        "resend_confirmation_unexpected",
        "Resend Confirmation Error",
        { email }
      );
      setError(processedError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSwitchToLogin = () => {
    setError(null);
    onSwitchToLogin();
  };

  if (isEmailSent) {
    return (
      <AuthDialog
        visible={true}
        onClose={onClose}
        title={t(
          "auth.emailConfirmation.resent.title",
          "Confirmation Email Resent"
        )}
        showCloseButton={true}
        enableCloseOnBackgroundPress={false}
        showSageIcon={false}>
        <View style={authDialogStyles.successContainer}>
          <View style={authDialogStyles.successIcon}>
            <Ionicons name="checkmark-circle" size={48} color="#10B981" />
          </View>

          <Text style={authDialogStyles.successMessage}>
            {t(
              "auth.emailConfirmation.resent.description",
              "We've sent another confirmation email to your inbox. Please check your email and click the confirmation link."
            )}
          </Text>

          <TouchableOpacity
            style={authDialogStyles.primaryButton}
            onPress={handleSwitchToLogin}
            disabled={isLoading}>
            <Text style={authDialogStyles.primaryButtonText}>
              {t("auth.emailConfirmation.backToLogin", "Back to Login")}
            </Text>
          </TouchableOpacity>
        </View>
      </AuthDialog>
    );
  }

  return (
    <AuthDialog
      visible={true}
      onClose={onClose}
      title={t("auth.emailConfirmation.title", "Check Your Email")}
      showCloseButton={true}
      enableCloseOnBackgroundPress={false}
      showSageIcon={false}>
      <View style={authDialogStyles.titleContainer}>
        <Text style={authDialogStyles.subtitle}>
          {t(
            "auth.emailConfirmation.description",
            "We've sent a confirmation email to your inbox. Please check your email and click the confirmation link to activate your account."
          )}
        </Text>

        <Text style={authDialogStyles.subtitle}>
          {t(
            "auth.emailConfirmation.subdescription",
            "Didn't receive the email? Check your spam folder or request a new one."
          )}
        </Text>
      </View>

      <View style={authDialogStyles.form}>
        <AuthInput
          label={t("auth.labels.email", "Email")}
          value={email}
          onChangeText={handleEmailChange}
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
          placeholder={t("auth.placeholders.email", "Enter your email")}
        />

        <TouchableOpacity
          style={[authDialogStyles.primaryButton, { marginTop: 16 }]}
          onPress={handleResendConfirmation}
          disabled={isSubmitting || isLoading}>
          <Text style={authDialogStyles.primaryButtonText}>
            {isSubmitting
              ? t("auth.emailConfirmation.resending", "Resending...")
              : t("auth.emailConfirmation.resend", "Resend Confirmation Email")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[authDialogStyles.secondaryButton, { marginTop: 12 }]}
          onPress={handleSwitchToLogin}
          disabled={isLoading}>
          <Text style={authDialogStyles.secondaryButtonText}>
            {t("auth.emailConfirmation.backToLogin", "Back to Login")}
          </Text>
        </TouchableOpacity>
      </View>

      {authError && <Text style={authDialogStyles.errorText}>{authError}</Text>}
    </AuthDialog>
  );
};

export default EmailConfirmationDialog;
