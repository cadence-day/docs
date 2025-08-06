import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AuthInput from "../shared/AuthInput";
import AppleSignInButton from "../shared/AppleSignInButton";
import { validateLoginForm } from "../../utils/validation";
import { useAuthStore } from "../../hooks/useAuthStore";
import { useAuthErrorHandler } from "../../utils/errorHandler";
import AuthDialog from "../shared/AuthDialog";
import { useI18n } from "@/shared/hooks/useI18n";
import authDialogStyles from "../shared/authDialogStyles";

interface LoginDialogProps {
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<any>;
  onSwitchToSignup: () => void;
  onSwitchToResetPassword: () => void;
  isLoading: boolean;
}

const LoginDialog: React.FC<LoginDialogProps> = ({
  onClose,
  onLogin,
  onSwitchToSignup,
  onSwitchToResetPassword,
  isLoading,
}) => {
  const { t } = useI18n();
  const { showAuthError } = useAuthErrorHandler();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setError, error: authError } = useAuthStore();

  useEffect(() => {
    // Clear auth error when component mounts
    setError(null);
  }, [setError]);

  const handleInputChange = (field: string, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async () => {
    const startTime = Date.now();

    const validation = validateLoginForm(formData);
    setErrors(validation.errors);

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await onLogin(formData.email.trim(), formData.password);

      if (result.error) {
        // Use the centralized error handler
        const processedError = showAuthError(
          result.error,
          "login",
          "Login Error",
          {
            email: formData.email,
            duration: Date.now() - startTime,
          }
        );

        setError(processedError.message);
        return;
      }

      onClose();
    } catch (error: any) {
      // Use the centralized error handler for unexpected errors
      const processedError = showAuthError(
        error,
        "login_unexpected_error",
        "Login Error",
        {
          email: formData.email,
          duration: Date.now() - startTime,
        }
      );

      setError(processedError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    formData.email &&
    formData.password &&
    !Object.values(errors).some((error) => error);

  return (
    <AuthDialog
      visible={true}
      onClose={onClose}
      title={t("auth.LoginDialog.welcomeBack")}
      showCloseButton={true}
      enableCloseOnBackgroundPress={false}
      enableDragging={false}>
      <AuthInput
        label={t("auth.LoginDialog.email")}
        value={formData.email}
        onChangeText={(text) => handleInputChange("email", text)}
        error={errors.email}
        isRequired
        keyboardType="email-address"
        autoComplete="email"
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="emailAddress"
        placeholder={t("auth.LoginDialog.email")}
        importantForAutofill="yes"
        returnKeyType="next"
      />

      <AuthInput
        label={t("auth.LoginDialog.password")}
        value={formData.password}
        onChangeText={(text) => handleInputChange("password", text)}
        error={errors.password}
        isRequired
        isPassword
        autoComplete="password"
        textContentType="password"
        placeholder={t("auth.LoginDialog.password")}
        returnKeyType="done"
        importantForAutofill="yes"
        onSubmitEditing={handleSubmit}
      />

      {authError && (
        <View style={authDialogStyles.errorContainer}>
          <Ionicons name="alert-circle" size={16} color="#fff" />
          <Text style={authDialogStyles.errorText}>{authError}</Text>
        </View>
      )}

      <TouchableOpacity
        onPress={onSwitchToResetPassword}
        style={authDialogStyles.forgotPassword}>
        <Text style={authDialogStyles.forgotPasswordText}>
          {t("auth.LoginDialog.forgotPassword")}
        </Text>
      </TouchableOpacity>

      <AppleSignInButton
        onSuccess={() => {
          // Apple Sign In successful, dialog will be closed by auth state change
          onClose();
        }}
        onError={(error) => {
          // Apple Sign In error will be handled by the button's error handling
          console.error("Apple Sign In error:", error);
        }}
        style={authDialogStyles.appleSignInButton}
      />

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={!isFormValid || isLoading || isSubmitting}
        style={[
          authDialogStyles.primaryButton,
          (!isFormValid || isLoading || isSubmitting) &&
            authDialogStyles.primaryButtonDisabled,
        ]}>
        <Text
          style={[
            authDialogStyles.primaryButtonText,
            (!isFormValid || isLoading || isSubmitting) &&
              authDialogStyles.primaryButtonTextDisabled,
          ]}>
          {isSubmitting
            ? t("auth.LoginDialog.signingIn")
            : t("auth.LoginDialog.signIn")}
        </Text>
      </TouchableOpacity>

      <View style={authDialogStyles.switchContainer}>
        <Text style={authDialogStyles.switchText}>
          {t("auth.LoginDialog.dontHaveAccount")}{" "}
        </Text>
        <TouchableOpacity onPress={onSwitchToSignup}>
          <Text style={authDialogStyles.linkText}>
            {t("auth.LoginDialog.signUp")}
          </Text>
        </TouchableOpacity>
      </View>
    </AuthDialog>
  );
};

export default LoginDialog;
