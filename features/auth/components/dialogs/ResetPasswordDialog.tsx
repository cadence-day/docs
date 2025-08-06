import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AuthInput from "../shared/AuthInput";
import { validateResetPasswordForm } from "../../utils/validation";
import { useAuthStore } from "../../hooks/useAuthStore";
import { useAuthErrorHandler } from "../../utils/errorHandler";
import AuthDialog from "../shared/AuthDialog";
import { useI18n } from "@/shared/hooks/useI18n";
import authDialogStyles from "../shared/authDialogStyles";

interface ResetPasswordDialogProps {
  onClose: () => void;
  onResetPassword: (email: string) => Promise<any>;
  onSwitchToLogin: () => void;
  isLoading: boolean;
}

const ResetPasswordDialog: React.FC<ResetPasswordDialogProps> = ({
  onClose,
  onResetPassword,
  onSwitchToLogin,
  isLoading,
}) => {
  const { t } = useI18n();
  const { showAuthError } = useAuthErrorHandler();
  const [email, setEmail] = useState("");
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

  const handleSubmit = async () => {
    const validation = validateResetPasswordForm({ email });
    setErrors(validation.errors);

    if (!validation.isValid) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await onResetPassword(email.trim());

      if (result.error) {
        // Use the centralized error handler
        const processedError = showAuthError(
          result.error,
          "reset_password",
          "Reset Password Error",
          { email }
        );

        setError(processedError.message);
        return;
      }

      // Successful email sent
      setIsEmailSent(true);
    } catch (error: any) {
      // Use the centralized error handler for unexpected errors
      const processedError = showAuthError(
        error,
        "reset_password_unexpected_error",
        "Reset Password Error",
        { email }
      );

      setError(processedError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTryAnotherEmail = () => {
    setIsEmailSent(false);
    setEmail("");
    setErrors({});
    setError(null);
  };

  const isFormValid = email && !errors.email;

  if (isEmailSent) {
    return (
      <AuthDialog
        visible={true}
        onClose={onClose}
        title={t("auth.checkYourEmail")}
        showCloseButton={true}
        enableCloseOnBackgroundPress={false}
        showSageIcon={false}>
        <View style={authDialogStyles.successContainer}>
          <View style={authDialogStyles.successIcon}>
            <Ionicons name="mail" size={48} color="#10B981" />
          </View>
          <Text style={authDialogStyles.successMessage}>
            {t("auth.passwordResetEmailSent")}
          </Text>
          <Text style={authDialogStyles.emailText}>{email}</Text>
          <Text style={authDialogStyles.instructionText}>
            {t("auth.checkEmailInstructions")}
          </Text>
          <TouchableOpacity
            style={authDialogStyles.secondaryButton}
            onPress={handleTryAnotherEmail}>
            <Text style={authDialogStyles.secondaryButtonText}>
              {t("auth.tryAnotherEmail")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onSwitchToLogin}
            style={authDialogStyles.linkContainer}>
            <Text style={authDialogStyles.linkText}>
              {t("auth.backToSignIn")}
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
      title={t("auth.resetPassword")}
      showCloseButton={true}
      enableCloseOnBackgroundPress={false}>
      <View style={authDialogStyles.titleContainer}>
        <Text style={authDialogStyles.subtitle}>
          {t("auth.resetPasswordInstructions")}
        </Text>
      </View>

      <AuthInput
        label={t("auth.email")}
        value={email}
        onChangeText={handleEmailChange}
        error={errors.email}
        isRequired
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
        placeholder={t("auth.email")}
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
      />

      {authError && (
        <View style={authDialogStyles.errorContainer}>
          <Ionicons name="alert-circle" size={16} color="#EF4444" />
          <Text style={authDialogStyles.errorText}>{authError}</Text>
        </View>
      )}

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={!isFormValid || isSubmitting}
        style={[
          authDialogStyles.primaryButton,
          (!isFormValid || isSubmitting) &&
            authDialogStyles.primaryButtonDisabled,
        ]}>
        <Text style={authDialogStyles.primaryButtonText}>
          {isSubmitting ? t("auth.sending") : t("auth.getResetLink")}
        </Text>
      </TouchableOpacity>

      <View style={authDialogStyles.linkContainer}>
        <TouchableOpacity onPress={onSwitchToLogin}>
          <Text style={authDialogStyles.linkText}>
            {t("auth.backToSignIn")}
          </Text>
        </TouchableOpacity>
      </View>
    </AuthDialog>
  );
};

export default ResetPasswordDialog;
