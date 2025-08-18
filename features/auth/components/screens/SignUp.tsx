import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  View,
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
import CdTextInput from "../../../../shared/components/CdTextInput";
import PasswordRequirement from "../shared/PasswordRequirement";
import CdButton from "../../../../shared/components/CdButton";
import CdText from "../../../../shared/components/CdText";

const SignUpScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [full_name, setName] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
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
      style={{ flex: 1, width: "100%", height: "100%" }}
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
            <CdText variant="title" size="large" style={styles.title}>Verify your email</CdText>
            <CdTextInput
              value={code}
              onChangeText={(code) => setCode(code)}
              keyboardType="number-pad"
              placeholder="Enter your verification code"
            />
            <CdButton
              title="Verify"
              onPress={onVerifyPress}
              variant="outline"
              size="medium"
              disabled={isSubmitting}
              style={styles.verifyButton}
            />
            
            <TouchableOpacity onPress={() => router.replace("/")}>
              <CdText variant="body" size="small" style={{ marginTop: 20, color: "#666" }}>← Back</CdText>
            </TouchableOpacity>
          </View>
        ) : isSuccess ? (
          <View style={styles.centerContent}>
            <CdText
              variant="title"
              size="large"
              style={{
                fontSize: 20,
                marginBottom: 16,
              }}
            >
              Welcome
            </CdText>
            <CdText
              variant="body"
              size="medium"
              style={{
                marginBottom: 32,
                width: "70%",
              }}
            >
              Check your inbox for verification email.
            </CdText>
            <Star5 width={100} height={100} />
            <View style={{ height: 20 }} />
            <CdText
              variant="title"
              size="medium"
              style={{
                fontSize: 18,
                marginBottom: 8,
              }}
            >
              Cadence is in beta.
            </CdText>
            <CdText
              variant="body"
              size="medium"
              style={{
                width: "76%",
              }}
            >
              We are working on improving the app. Your feedback would be
              greatly appreciated. You can find the link to feedback page under
              the Profile.
            </CdText>
          </View>
        ) : (
          <View style={styles.formContainer}>
            <CdText variant="title" size="large" style={styles.title}>Sign up</CdText>

            <CdTextInput
              placeholder="Name"
              value={full_name}
              onChangeText={setName}
              autoCapitalize="words"
              textContentType="name"
              autoComplete="name"
            />

            {/* Email Field */}
            <CdTextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
              autoComplete="email"
            />

            {/* Password Field */}
            <CdTextInput
              placeholder="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (!text) {
                  setPasswordError(null);
                }
              }}
              isPassword={true}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="password"
              textContentType="newPassword"
              importantForAutofill="yes"
            />

            <CdTextInput
              placeholder="Repeat Password"
              value={repeatPassword}
              onChangeText={setRepeatPassword}
              isPassword={true}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="password"
              textContentType="newPassword"
              importantForAutofill="yes"
              returnKeyType="done"
            />

            {passwordError &&
              password.length > 0 &&
              repeatPassword.length > 0 && (
                <CdText variant="error" size="small" style={styles.passwordMismatchText}>{passwordError}</CdText>
              )}

            {/* Password Requirements */}
                <PasswordRequirement 
                password={password}
                repeatPassword={repeatPassword}
                />


            {/* Sign Up Button */}
            <CdButton
              title="Sign Up"
              onPress={onSignUpPress}
              variant="outline"
              size="medium"
              disabled={isSubmitting}
              style={styles.signupButton}
            />

            {/* Redirect to sign in */}
            <CdText variant="body" size="small" style={styles.signInText}>
              Already have an account?{" "}
              <TouchableOpacity onPress={() => router.push("/") }>
                <CdText variant="link" size="medium">
                  Sign in now.
                </CdText>
              </TouchableOpacity>
            </CdText>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  form: {
    width: "100%",
    paddingVertical: 40,
    paddingHorizontal: 16,
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
  },
  verifyButton: {
    width: "100%",
    marginTop: 10,
  },
  passwordMismatchText: {
    color: "#ff6b6b",
    fontSize: 12,
    marginTop: 4,
    marginBottom: 4,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    minHeight: 400,
    paddingHorizontal: 16,
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

export default SignUpScreen;
