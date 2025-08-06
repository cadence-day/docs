import React, { useState } from "react";
import { View, Text, TouchableOpacity, Switch } from "react-native";
import * as WebBrowser from "expo-web-browser";
import AuthInput from "../shared/AuthInput";
import AppleSignInButton from "../shared/AppleSignInButton";
import PasswordStrengthIndicator from "../shared/PasswordStrengthIndicator";
import { validateSignupForm } from "../../utils/validation";
import { SignupForm } from "../../utils/types";
import AuthDialog from "../shared/AuthDialog";
import { useI18n } from "@/shared/hooks/useI18n";
import authDialogStyles from "../shared/authDialogStyles";

interface SignupDialogProps {
  onClose: () => void;
  onSignup: (formData: SignupForm) => Promise<any>;
  onSwitchToLogin: () => void;
  isLoading: boolean;
}

const SignupDialog: React.FC<SignupDialogProps> = ({
  onClose,
  onSignup,
  onSwitchToLogin,
  isLoading,
}) => {
  const { t } = useI18n();
  const [formData, setFormData] = useState<SignupForm>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  // Check if password is valid (basic validation)
  const isPasswordValid = (password: string): boolean => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(password)
    );
  };

  const shouldShowConfirmPassword =
    formData.password && isPasswordValid(formData.password);

  const passwordsMatch =
    formData.confirmPassword && formData.password === formData.confirmPassword;

  const handleInputChange = (
    field: keyof SignupForm,
    value: string | boolean
  ) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async () => {
    const validation = validateSignupForm(formData);
    setErrors(validation.errors);

    if (!validation.isValid) {
      return;
    }

    try {
      await onSignup(formData);
    } catch (error: any) {
      // Error handling is done in the parent component
      console.error("Signup error:", error);
    }
  };

  const handleOpenTerms = async () => {
    await WebBrowser.openBrowserAsync("https://app.cadence.day/legal/terms", {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
    });
  };

  const handleOpenPrivacy = async () => {
    await WebBrowser.openBrowserAsync("https://app.cadence.day/legal/privacy", {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
    });
  };

  const isFormValid =
    formData.fullName.trim() &&
    formData.email.trim() &&
    formData.password &&
    isPasswordValid(formData.password) &&
    (!shouldShowConfirmPassword || formData.confirmPassword) &&
    formData.agreeToTerms &&
    Object.values(errors).every((error) => !error);

  return (
    <AuthDialog
      visible={true}
      onClose={onClose}
      title={t("auth.signUp")}
      showCloseButton={true}
      enableCloseOnBackgroundPress={false}>
      <AuthInput
        label={t("auth.firstName")}
        value={formData.fullName}
        onChangeText={(text) => handleInputChange("fullName", text)}
        error={errors.fullName}
        isRequired
        autoComplete="name"
        textContentType="name"
        placeholder={t("auth.firstName")}
        returnKeyType="next"
      />

      <AuthInput
        label={t("auth.email")}
        value={formData.email}
        onChangeText={(text) => handleInputChange("email", text)}
        error={errors.email}
        isRequired
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
        placeholder={t("auth.email")}
        returnKeyType="next"
      />

      <AuthInput
        label={t("auth.password")}
        value={formData.password}
        onChangeText={(text) => handleInputChange("password", text)}
        error={errors.password}
        isRequired
        isPassword
        autoComplete="new-password"
        textContentType="newPassword"
        placeholder={t("auth.password")}
        returnKeyType="next"
        onFocus={() => setIsPasswordFocused(true)}
        onBlur={() => setIsPasswordFocused(false)}
      />

      {isPasswordFocused && formData.password && (
        <PasswordStrengthIndicator password={formData.password} />
      )}

      {shouldShowConfirmPassword && (
        <>
          <AuthInput
            label={t("auth.confirmPassword")}
            value={formData.confirmPassword}
            onChangeText={(text) => handleInputChange("confirmPassword", text)}
            error={errors.confirmPassword}
            isRequired
            isPassword
            autoComplete="new-password"
            textContentType="newPassword"
            placeholder={t("auth.confirmPassword")}
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
          />
        </>
      )}

      <View style={authDialogStyles.switchContainer}>
        <Switch
          value={formData.agreeToTerms}
          onValueChange={(value) => handleInputChange("agreeToTerms", value)}
          trackColor={{ false: "#D1D5DB", true: "#6646EC" }}
          thumbColor={formData.agreeToTerms ? "#FFFFFF" : "#F3F4F6"}
        />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={authDialogStyles.switchText}>
            {t("auth.agreeToTerms")}{" "}
            <Text style={authDialogStyles.linkText} onPress={handleOpenTerms}>
              {t("auth.termsOfService")}
            </Text>{" "}
            {t("auth.and")}{" "}
            <Text style={authDialogStyles.linkText} onPress={handleOpenPrivacy}>
              {t("auth.privacyPolicy")}
            </Text>
          </Text>
          {errors.agreeToTerms && (
            <Text style={authDialogStyles.errorText}>
              {errors.agreeToTerms}
            </Text>
          )}
        </View>
      </View>

      <View style={authDialogStyles.switchContainer}>
        <Text style={authDialogStyles.switchText}>
          {t("auth.alreadyHaveAccount")}{" "}
        </Text>
        <TouchableOpacity onPress={onSwitchToLogin}>
          <Text style={authDialogStyles.linkText}>{t("auth.signInNow")}</Text>
        </TouchableOpacity>
        <Text style={authDialogStyles.switchText}>.</Text>
      </View>

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
        disabled={!isFormValid || isLoading || !passwordsMatch}
        style={[
          authDialogStyles.primaryButton,
          (!isFormValid || isLoading) && authDialogStyles.primaryButtonDisabled,
        ]}>
        <Text
          style={[
            authDialogStyles.primaryButtonText,
            (!isFormValid || isLoading) &&
              authDialogStyles.primaryButtonTextDisabled,
          ]}>
          {isLoading ? t("auth.signingUp") : t("auth.signUp")}
        </Text>
      </TouchableOpacity>
    </AuthDialog>
  );
};

export default SignupDialog;
