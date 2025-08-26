import { CdButton, CdText, CdTextInput } from "@/shared/components/CadenceUI";
import Toast from "@/shared/components/Toast";
import SageIcon from "@/shared/components/icons/SageIcon";
import { useToast } from "@/shared/hooks";
import { useSignUp } from "@clerk/clerk-expo";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import { TextInput, View } from "react-native";
import {
  clearAllClerkErrors,
  createClerkErrorClearer,
  handleAuthError,
  isValidEmail,
  parseClerkErrors,
  validateEmailField,
  validateName,
  validatePasswordField,
  validateRepeatPasswordField,
  type ClerkErrorMapping,
} from "../../utils";
import DirectToSignIn from "../shared/DirectToSignIn";
import EmailVerification from "../shared/EmailVerification";
import PasswordRequirement from "../shared/PasswordRequirement";
import SignUpSuccess from "../shared/SignUpSuccess";
import TermsCheckbox from "../shared/TermsCheckbox";
import { styles } from "../style";

const SignUpScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [full_name, setName] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");

  // Form validation states
  const [errors, setErrors] = useState({
    name: null as string | null,
    email: null as string | null,
    password: null as string | null,
    repeatPassword: null as string | null,
  });

  const [fieldTouched, setFieldTouched] = useState({
    name: false,
    email: false,
    password: false,
    repeatPassword: false,
  });

  // Clerk server errors state
  const [clerkErrors, setClerkErrors] = useState<ClerkErrorMapping>({
    email: null,
    firstName: null,
    lastName: null,
    password: null,
    general: null,
  });

  const { isLoaded, signUp } = useSignUp();
  const { toast, showError, hideToast } = useToast();

  // Input refs for keyboard navigation
  const nameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const repeatPasswordRef = useRef<TextInput>(null); // Handle going back from verification to sign-up form
  const handleBackToSignUp = () => {
    setPendingVerification(false);
    setCode("");
    // Clear any verification-related errors
    clearAllClerkErrors(setClerkErrors);
  };

  // Clear Clerk errors when user starts typing
  const clearClerkError = createClerkErrorClearer(setClerkErrors);

  // Check if form is valid
  const isFormValid = () => {
    const nameParts = full_name.trim().split(" ");
    const hasValidName =
      nameParts.length >= 2 && nameParts[1].trim().length > 0;

    return (
      hasValidName &&
      isValidEmail(email) &&
      validatePasswordField(password) === null &&
      password === repeatPassword &&
      agreeToTerms
    );
  };

  // Handle field validation on blur
  const handleFieldBlur = (field: keyof typeof fieldTouched) => {
    setFieldTouched((prev) => ({ ...prev, [field]: true }));

    let error: string | null = null;
    switch (field) {
      case "name":
        error = validateName(full_name);
        break;
      case "email":
        error = validateEmailField(email);
        break;
      case "password":
        error = validatePasswordField(password);
        break;
      case "repeatPassword":
        error = validateRepeatPasswordField(repeatPassword, password);
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  // Real-time validation for touched fields
  useEffect(() => {
    if (fieldTouched.name) {
      setErrors((prev) => ({ ...prev, name: validateName(full_name) }));
    }
  }, [full_name, fieldTouched.name]);

  useEffect(() => {
    if (fieldTouched.email) {
      setErrors((prev) => ({ ...prev, email: validateEmailField(email) }));
    }
  }, [email, fieldTouched.email]);

  useEffect(() => {
    if (fieldTouched.password) {
      setErrors((prev) => ({
        ...prev,
        password: validatePasswordField(password),
      }));
    }
  }, [password, fieldTouched.password]);

  useEffect(() => {
    if (fieldTouched.repeatPassword) {
      setErrors((prev) => ({
        ...prev,
        repeatPassword: validateRepeatPasswordField(repeatPassword, password),
      }));
    }
  }, [repeatPassword, password, fieldTouched.repeatPassword]);

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded || !isFormValid()) return;

    setIsSubmitting(true);
    // Clear all Clerk errors before attempting signup
    clearAllClerkErrors(setClerkErrors);

    try {
      // Split full name into first and last name
      const nameParts = full_name.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

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
      handleAuthError(err, "SIGNUP_ATTEMPT", {
        email: email,
        fullName: full_name,
        hasPassword: !!password,
      });

      // Parse Clerk errors using utility function
      const parsedError = parseClerkErrors(err);
      setClerkErrors(parsedError.fieldErrors);

      // Show toast notification for the error
      if (parsedError.toastMessage) {
        showError(parsedError.toastMessage);
      }
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
      style={styles.container}
    >
      <View style={styles.form}>
        {isSubmitting ? (
          <View style={styles.centerContent}>
            <SageIcon status="pulsating" size={200} />
          </View>
        ) : pendingVerification ? (
          <EmailVerification
            code={code}
            setCode={setCode}
            onVerificationSuccess={() => setIsSuccess(true)}
            onBackToSignUp={handleBackToSignUp}
            userEmail={email}
          />
        ) : isSuccess ? (
          <SignUpSuccess />
        ) : (
          <View style={styles.formContainer}>
            <CdText variant="title" size="large" style={styles.title}>
              Sign up
            </CdText>

            <CdTextInput
              ref={nameRef}
              placeholder="First and Last Name"
              value={full_name}
              onChangeText={(text) => {
                setName(text);
                clearClerkError("firstName");
                clearClerkError("lastName");
              }}
              onBlur={() => handleFieldBlur("name")}
              error={
                clerkErrors.firstName ||
                clerkErrors.lastName ||
                (fieldTouched.name && full_name.length >= 0
                  ? errors.name
                  : null)
              }
              autoCapitalize="words"
              textContentType="name"
              autoComplete="name"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
            />

            {/* Email Field */}
            <CdTextInput
              ref={emailRef}
              placeholder="Email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                clearClerkError("email");
              }}
              onBlur={() => handleFieldBlur("email")}
              error={
                clerkErrors.email ||
                (fieldTouched.email && email.length >= 0 ? errors.email : null)
              }
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
              autoComplete="email"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />

            {/* Password Field */}
            <CdTextInput
              ref={passwordRef}
              placeholder="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                clearClerkError("password");
              }}
              onBlur={() => handleFieldBlur("password")}
              error={
                clerkErrors.password ||
                (fieldTouched.password && password.length >= 0
                  ? errors.password
                  : null)
              }
              isPassword={true}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="password"
              textContentType="newPassword"
              importantForAutofill="yes"
              returnKeyType={password ? "next" : "done"}
              onSubmitEditing={() => {
                if (password) {
                  repeatPasswordRef.current?.focus();
                }
              }}
            />

            {password && (
              <CdTextInput
                ref={repeatPasswordRef}
                placeholder="Repeat Password"
                value={repeatPassword}
                onChangeText={setRepeatPassword}
                onBlur={() => handleFieldBlur("repeatPassword")}
                error={
                  fieldTouched.repeatPassword && repeatPassword.length >= 0
                    ? errors.repeatPassword
                    : null
                }
                isPassword={true}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password"
                textContentType="newPassword"
                importantForAutofill="yes"
                returnKeyType="done"
                onSubmitEditing={onSignUpPress}
              />
            )}

            {/* Password Strength Indicator */}
            {password && (
              <PasswordRequirement
                password={password}
                repeatPassword={repeatPassword}
              />
            )}

            <TermsCheckbox
              isChecked={agreeToTerms}
              onToggle={setAgreeToTerms}
            />
            <DirectToSignIn />
          </View>
        )}

        <View style={styles.actionButtonContainer}>
          {pendingVerification ? (
            <CdButton
              title="Change Email"
              onPress={handleBackToSignUp}
              variant="outline"
              size="large"
            />
          ) : isSuccess ? null : (
            <CdButton
              title={isSubmitting ? "Creating Account..." : "Sign up"}
              onPress={onSignUpPress}
              variant="text"
              size="large"
              disabled={!isFormValid() || isSubmitting}
            />
          )}
        </View>
      </View>

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onHide={hideToast}
      />
    </LinearGradient>
  );
};

export default SignUpScreen;
