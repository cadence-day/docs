import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { useSignUp } from "@clerk/clerk-expo";
import SageIcon from "@/shared/components/icons/SageIcon";
import PasswordRequirement from "../shared/PasswordRequirement";
import CdTextInput from "@/shared/components/CdTextInput";
import CdButton from "@/shared/components/CdButton";
import CdText from "@/shared/components/CdText";
import { validatePassword } from "../../utils";
import SignUpSuccess from "../shared/SignUpSuccess";
import EmailVerification from "../shared/EmailVerification";
import TermsAndPrivacy from "../shared/TermsAndPrivacy";

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

    // Validate password using utility function
    const validation = validatePassword(password, repeatPassword, agreeToTerms);
    if (!validation.isValid) {
      setPasswordError(validation.error);
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
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code: code,
      });

      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        setIsSuccess(true);
      } else {
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
      <View 
        style={styles.form}
      >
        {isSubmitting ? (
          <View style={styles.centerContent}>
            <SageIcon status="pulsating" size={200} />
          </View>
        ) : pendingVerification ? (
          <EmailVerification code={code} setCode={setCode} />
        ) : isSuccess ? (
          <SignUpSuccess />
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
                <CdText variant="error" size="medium" style={styles.passwordMismatchText}>{passwordError}</CdText>
              )}

            {/* Password Requirements */}
              <PasswordRequirement 
                password={password}
                repeatPassword={repeatPassword}
                />

            <TermsAndPrivacy />

            {/* Redirect to sign in */}
            <View style={styles.signInTextContainer}> 
              <CdText variant="body" size="small" style={styles.signInText}>
                Already have an account?{" "}
              </CdText>
              <TouchableOpacity onPress={() => router.push("/(auth)/sign-in") }>
                  <CdText variant="link" size="medium">
                    Sign in now.
                  </CdText>
              </TouchableOpacity>
            </View>
         {/* Sign Up Button */}
         
          </View>
        )}
        <View style={styles.actionButtonContainer}>
          <CdButton
            title="Sign up"
            onPress={onSignUpPress}
            variant="text"
            size="large"
          />
        </View>

      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  form: {
    width: "100%",
    paddingVertical: 100,
    paddingHorizontal:40,
    alignItems: "center",
    minHeight: "100%",
  },
  formContainer: {
    width: "100%",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "normal",
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
  signInTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
    marginTop: 20,
  },
  signInText: {
    color: "#B9B9B9",
    // width: "100%",
    fontSize: 14,
    marginTop: 20,
    marginBottom: 20,
    textAlign: "left",
  },
  actionButtonContainer: {
    position: "absolute",
    bottom: 60,
    width: "100%",
    marginTop: 10,
    alignItems: "center",
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
