import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSignUp } from "@clerk/clerk-expo";
import SageIcon from "@/shared/components/icons/SageIcon";
import { Star5 } from "@/shared/components/icons/SageIcon";
import { CustomCheckbox } from "@/shared/components/ui/CustomCheckBox";

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [full_name, setName] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const { isLoaded, signUp, setActive } = useSignUp();

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return;

    // Validate passwords match
    if (password !== repeatPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    // Validate password requirements
    if (password.length < 10) {
      setPasswordError("Password must be at least 10 characters");
      return;
    }

    if (!/[a-z]/.test(password)) {
      setPasswordError("Password must contain at least one lowercase letter");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setPasswordError("Password must contain at least one uppercase letter");
      return;
    }

    if (!/[0-9]/.test(password)) {
      setPasswordError("Password must contain at least one digit");
      return;
    }

    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|<>?,./`~]/.test(password)) {
      setPasswordError("Password must contain at least one special character");
      return;
    }

    if (!agreeToTerms) {
      setPasswordError("You must agree to the terms and conditions");
      return;
    }

    setIsSubmitting(true);
    setPasswordError(null);

    try {
      // Split full name into first and last name
      const nameParts = full_name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
      });

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      // Set 'pendingVerification' to true to display second form
      setPendingVerification(true);
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      setPasswordError("An error occurred during sign up. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return;

    setIsSubmitting(true);

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        setIsSuccess(true);
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2));
        setPasswordError("Verification failed. Please try again.");
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      setPasswordError("Verification failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LinearGradient
      colors={["#2B2B2B", "#151414"]}
      locations={[0, 0.6]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <ScrollView 
        contentContainerStyle={styles.form}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {isSubmitting ? (
          <View style={styles.centerContent}>
            <SageIcon status="pulsating" size={200} />
          </View>
        ) : pendingVerification ? (
          <View style={styles.centerContent}>
            <Text style={styles.title}>Verify your email</Text>
            <TextInput
              style={styles.input}
              value={code}
              placeholder="Enter your verification code"
              placeholderTextColor="#B9B9B9"
              onChangeText={(code) => setCode(code)}
              keyboardType="number-pad"
            />
            <TouchableOpacity 
              style={styles.signupButton}
              onPress={onVerifyPress}
              disabled={isSubmitting}
            >
              <Text style={styles.signupButtonText}>Verify</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => router.replace("/")}>
              <Text style={{ marginTop: 20, color: "#666" }}>← Back</Text>
            </TouchableOpacity>
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
          <View style={styles.formContainer}>
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
                onPress={() => {}}
                style={{ marginBottom: 8 }}
              >
                <Text
                  style={{
                    textDecorationLine: "underline",
                    color: "white",
                    fontSize: 12,
                  }}
                >
                  Terms and conditions
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {}}
                style={{ marginBottom: 16 }}
              >
                <Text
                  style={{
                    textDecorationLine: "underline",
                    color: "white",
                    fontSize: 12,
                  }}
                >
                  Privacy policy
                </Text>
              </TouchableOpacity>
            </View>

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

            {/* Sign Up Button */}
            <TouchableOpacity 
              style={styles.signupButton}
              onPress={onSignUpPress}
              disabled={isSubmitting}
            >
              <Text style={styles.signupButtonText}>Sign Up</Text>
            </TouchableOpacity>

            {/* Redirect to sign in */}
            <Text style={styles.signInText}>
              Already have an account?{" "}
              <Text style={styles.link} onPress={() => router.push("/") }>
                Sign in now.
              </Text>
            </Text>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  form: {
    width: "90%",
    paddingVertical: 40,
    alignItems: "center",
    minHeight: "100%",
  },
  formContainer: {
    width: "100%",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 30,
    marginTop: 20,
    color: "#fff",
    fontWeight: "600",
  },
  input: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#B9B9B9",
    color: "#fff",
    fontSize: 16,
    marginBottom: 24,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  passwordContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    marginBottom: 24,
  },
  passwordInput: {
    marginBottom: 0,
    paddingRight: 50, // Make room for the eye icon
  },
  eyeIcon: {
    position: "absolute",
    right: 0,
    height: "100%",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingBottom: 12,
  },
  socialButtons: {
    width: "100%",
    height: 100,
    flexDirection: "column",
    justifyContent: "space-between",
    marginTop: 30,
  },
  socialButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 20,
    marginBottom: 30,
    width: "100%",
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#181818",
  },
  checkboxBoxChecked: {
    borderColor: "#6646EC",
  },
  checkboxCheck: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  checkboxText: {
    color: "#B9B9B9",
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    flexWrap: "wrap",
    lineHeight: 20,
  },
  link: {
    textDecorationLine: "underline",
    color: "#fff",
  },
  signInText: {
    color: "#B9B9B9",
    width: "100%",
    fontSize: 14,
    marginTop: 20,
    marginBottom: 20,
    textAlign: "center",
  },
  signupButton: {
    width: "100%",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  signupButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  passwordMismatchText: {
    color: "#ff6b6b",
    fontSize: 12,
    marginTop: 4,
    marginBottom: 4,
  },
  passwordRequirements: {
    width: "100%",
    marginTop: 8,
    marginBottom: 20,
  },
  requirementMet: {
    color: "#4CAF50",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    minHeight: 400,
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 16,
  },
  successTitle: {
    color: "#fff",
    fontSize: 24,
    marginBottom: 16,
  },
  successText: {
    color: "grey",
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
});
