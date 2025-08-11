import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
  Pressable,
} from "react-native";
import Dialog from "@/components/ui/elements/Dialog";
import { styles } from "./style";
import { signUpWithEmail } from "@/supabase/client";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser"; // added
import SageIcon, { Star5 } from "@/components/ui/Icons/SageIcon";

interface SignUpDialogProps {
  visible: boolean;
  onClose: () => void;
  closeDialog: () => void;
}

interface CheckboxProps {
  value: boolean;
  onValueChange: (val: boolean) => void;
  disabled?: boolean;
}

const CustomCheckbox: React.FC<CheckboxProps> = ({
  value,
  onValueChange,
  disabled,
}) => (
  <TouchableOpacity
    style={[styles.checkboxBox, value && styles.checkboxBoxChecked]}
    onPress={() => onValueChange(!value)}
    activeOpacity={0.7}
    disabled={disabled}
  >
    {value && <Text style={styles.checkboxCheck}>✓</Text>}
  </TouchableOpacity>
);

const SignUpDialog: React.FC<SignUpDialogProps> = ({
  visible,
  onClose,
  closeDialog,
}) => {
  const [full_name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Check if all password requirements are met
  const isPasswordValid = (pass: string): boolean => {
    return (
      pass.length >= 10 &&
      /[a-z]/.test(pass) &&
      /[A-Z]/.test(pass) &&
      /[0-9]/.test(pass) &&
      /[!@#$%^&*()_+\-=[\]{};':"\\|<>?,./`~]/.test(pass)
    );
  };

  // Password validation function
  const validatePassword = (password: string): string | null => {
    if (password.length < 10) {
      return "Password should be at least 10 characters.";
    }
    if (!/[a-z]/.test(password)) {
      return "Password should contain at least one lowercase letter.";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password should contain at least one uppercase letter.";
    }
    if (!/[0-9]/.test(password)) {
      return "Password should contain at least one digit.";
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|<>?,./`~]/.test(password)) {
      return "Password should contain at least one special character.";
    }
    return null;
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setRepeatPassword("");
    setAgreeToTerms(false);
    setShowPassword(false);
    setShowRepeatPassword(false);
  };

  // Reset form when dialog is closed
  React.useEffect(() => {
    if (!visible) {
      resetForm();
    }
  }, [visible]);

  const handleSignUp = async () => {
    // Check for missing fields
    if (!full_name.trim() || !email.trim() || !password || !repeatPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    if (!agreeToTerms) {
      Alert.alert("Error", "You must agree to the terms and conditions.");
      return;
    }
    if (password !== repeatPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    const passwordError = validatePassword(password);
    if (passwordError) {
      setPasswordError(passwordError);
      return;
    }
    setIsSubmitting(true);
    try {
      const { error, data } = await signUpWithEmail(
        email,
        password,
        full_name,
        agreeToTerms
      );
      if (error) {
        Alert.alert("Error", error.message);
        setIsSubmitting(false);
        return;
      }
      if (data) {
        setIsSuccess(true);
        resetForm();
      }
    } catch {
      Alert.alert("Error", "An unexpected error occurred");
    }
    setTimeout(() => {
      setIsSubmitting(false);
    }, 2000);
  };

  const handleClose = () => {
    if (isSuccess) {
      onClose();
      // Reset states after dialog closes
      setTimeout(() => {
        setIsSuccess(false);
        resetForm();
      }, 300);
    } else {
      onClose();
      resetForm();
    }
  };

  const isFormInvalid =
    !agreeToTerms ||
    !full_name.trim() ||
    !email.trim() ||
    !password ||
    !repeatPassword ||
    password !== repeatPassword ||
    !isPasswordValid(password);

  // Helper to open links in in-app browser
  const openInAppBrowser = async (url: string) => {
    await WebBrowser.openBrowserAsync(url);
  };

  return (
    <Dialog
      visible={visible}
      onClose={() => {
        onClose();
        resetForm();
      }}
      closeDialog={() => {
        closeDialog();
        resetForm();
      }}
      title="Sign up"
      isTitleVisible={false}
      isDoneButtonVisible
      actionButtonTitle={isSuccess && !isSubmitting ? "Continue" : "Sign up"}
      isActionButtonRectangular={false}
      actionCallback={isSuccess && !isSubmitting ? handleClose : handleSignUp}
      disabledActionButton={
        isSuccess && !isSubmitting ? false : isFormInvalid || isSubmitting
      }
    >
      <View style={styles.form}>
        {isSubmitting ? (
          <View style={styles.centerContent}>
            <SageIcon status="pulsating" size={200} />
          </View>
        ) : isSuccess ? (
          <View style={styles.centerContent}>
            <Text
              style={{
                fontSize: 20,
                color: "white",
                textAlign: "center",
                marginBottom: 16,
              }}
            >
              Welcome
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: "white",
                textAlign: "center",
                marginBottom: 32,
                width: "70%",
              }}
            >
              Check your inbox for verification email.
            </Text>
            <Star5 width={100} height={100} />
            <View style={{ height: 20 }} />
            <Text
              style={{
                fontSize: 18,
                color: "white",
                fontWeight: "bold",
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              Cadence is in beta.
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: "white",
                textAlign: "center",
                width: "76%",
              }}
            >
              We are working on improving the app. Your feedback would be
              greatly appreciated. You can find the link to feedback page under
              the Profile.
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.title}>Sign up</Text>

            <TextInput
              style={styles.input}
              placeholder="Name"
              placeholderTextColor="#B9B9B9"
              value={full_name}
              onChangeText={setName}
              autoCapitalize="words"
              textContentType="name"
              autoComplete="name"
              editable={!isSubmitting}
            />
            {/* Email Field */}
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#B9B9B9"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
              autoComplete="email"
              editable={!isSubmitting}
            />

            {/* Password Field */}
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Password"
                placeholderTextColor="#B9B9B9"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (!text) {
                    setPasswordError(null);
                  }
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password"
                textContentType="newPassword"
                importantForAutofill="yes"
                editable={!isSubmitting}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword((prev) => !prev)}
                activeOpacity={0.7}
                disabled={isSubmitting}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#B9B9B9"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Repeat Password"
                placeholderTextColor="#B9B9B9"
                value={repeatPassword}
                onChangeText={setRepeatPassword}
                secureTextEntry={!showRepeatPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password"
                textContentType="newPassword"
                importantForAutofill="yes"
                returnKeyType="done"
                editable={!isSubmitting}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowRepeatPassword((prev) => !prev)}
                activeOpacity={0.7}
                disabled={isSubmitting}
              >
                <Ionicons
                  name={showRepeatPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#B9B9B9"
                />
              </TouchableOpacity>
            </View>

            {passwordError &&
              password.length > 0 &&
              repeatPassword.length > 0 && (
                <Text style={styles.passwordMismatchText}>{passwordError}</Text>
              )}

            {/* Password Requirements */}
            <View style={styles.passwordRequirements}>
              <Text
                style={[
                  styles.passwordMismatchText,
                  password.length >= 10 && styles.requirementMet,
                ]}
              >
                The password should be at least 10 characters.
              </Text>
              <Text
                style={[
                  styles.passwordMismatchText,
                  /[a-z]/.test(password) && styles.requirementMet,
                ]}
              >
                Contain one lowercase letter.
              </Text>
              <Text
                style={[
                  styles.passwordMismatchText,
                  /[A-Z]/.test(password) && styles.requirementMet,
                ]}
              >
                Contain one uppercase letter.
              </Text>
              <Text
                style={[
                  styles.passwordMismatchText,
                  /[0-9]/.test(password) && styles.requirementMet,
                ]}
              >
                Contain one digit.
              </Text>
              <Text
                style={[
                  styles.passwordMismatchText,
                  /[!@#$%^&*()_+\-=[\]{};':"\\|<>?,./`~]/.test(password) &&
                    styles.requirementMet,
                ]}
              >
                Contain one special character.
              </Text>

              <Text
                style={[
                  styles.passwordMismatchText,
                  password === repeatPassword &&
                    password.length > 0 &&
                    styles.requirementMet,
                ]}
              >
                Passwords should match.
              </Text>
              <View style={{ height: 20 }} />
              <TouchableOpacity
                onPress={() =>
                  openInAppBrowser("https://app.cadence.day/legal/terms")
                }
              >
                <Text
                  style={[
                    {
                      textDecorationLine: "underline",
                      color: "white",
                      fontSize: 12,
                    },
                  ]}
                >
                  Terms and conditions
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  openInAppBrowser("https://app.cadence.day/legal/privacy")
                }
              >
                <Text
                  style={[
                    {
                      textDecorationLine: "underline",
                      color: "white",
                      fontSize: 12,
                    },
                  ]}
                >
                  Privacy policy
                </Text>
              </TouchableOpacity>
            </View>

            {/* Loader */}
            {isSubmitting && (
              <View style={{ alignItems: "center", marginVertical: 8 }}>
                <ActivityIndicator size="small" color="#B9B9B9" />
              </View>
            )}

            {/* Terms & Conditions */}
            <View style={styles.checkboxRow}>
              <CustomCheckbox
                value={agreeToTerms}
                onValueChange={setAgreeToTerms}
                disabled={isSubmitting}
              />
              <Text style={styles.checkboxText}>
                I agree to the{" "}
                <Text style={{ color: "white" }} suppressHighlighting>
                  Terms & Conditions
                </Text>{" "}
                and <Text style={{ color: "white" }}>Privacy Policy</Text>.
              </Text>
            </View>

            {/* Redirect to sign in */}
            <Text style={styles.signInText}>
              Already have an account?{" "}
              <Text style={styles.link} onPress={onClose}>
                Sign in now.
              </Text>
            </Text>
          </>
        )}
      </View>
    </Dialog>
  );
};

export default SignUpDialog;
