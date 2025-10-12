import { CdButton, CdText, CdTextInput } from "@/shared/components/CadenceUI";
import Toast from "@/shared/components/Toast";
import SageIcon from "@/shared/components/icons/SageIcon";
import { COLORS } from "@/shared/constants/COLORS";
import { CONTAINER } from "@/shared/constants/CONTAINER";
import { isDev } from "@/shared/constants/isDev";
import { useToast } from "@/shared/hooks";
import { useI18n } from "@/shared/hooks/useI18n";
import { useSignUp } from "@clerk/clerk-expo";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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

type Errors = {
  name: string | null;
  email: string | null;
  password: string | null;
  repeatPassword: string | null;
};

type FieldTouched = {
  name: boolean;
  email: boolean;
  password: boolean;
  repeatPassword: boolean;
};

const SignUpScreen: React.FC = () => {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [full_name, setName] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const [errors, setErrors] = useState<Errors>({
    name: null,
    email: null,
    password: null,
    repeatPassword: null,
  });

  const [fieldTouched, setFieldTouched] = useState<FieldTouched>({
    name: false,
    email: false,
    password: false,
    repeatPassword: false,
  });

  const [clerkErrors, setClerkErrors] = useState<ClerkErrorMapping>({
    email: null,
    firstName: null,
    lastName: null,
    password: null,
    general: null,
  });

  const { isLoaded, signUp } = useSignUp();
  const { toast, showError, hideToast } = useToast();

  const nameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const repeatPasswordRef = useRef<TextInput>(null);

  const clearClerkError = createClerkErrorClearer(setClerkErrors);

  // Keyboard visibility listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => setIsKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => setIsKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

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

  const handleFieldBlur = (field: keyof FieldTouched) => {
    setFieldTouched((prev: FieldTouched) => ({ ...prev, [field]: true }));

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

    setErrors((prev: Errors) => ({ ...prev, [field]: error }) as Errors);
  };

  useEffect(() => {
    if (fieldTouched.name) {
      setErrors((prev: Errors) => ({ ...prev, name: validateName(full_name) }));
    }
  }, [full_name, fieldTouched.name]);

  useEffect(() => {
    if (fieldTouched.email) {
      setErrors((prev: Errors) => ({
        ...prev,
        email: validateEmailField(email),
      }));
    }
  }, [email, fieldTouched.email]);

  useEffect(() => {
    if (fieldTouched.password) {
      setErrors((prev: Errors) => ({
        ...prev,
        password: validatePasswordField(password),
      }));
    }
  }, [password, fieldTouched.password]);

  useEffect(() => {
    if (fieldTouched.repeatPassword) {
      setErrors((prev: Errors) => ({
        ...prev,
        repeatPassword: validateRepeatPasswordField(repeatPassword, password),
      }));
    }
  }, [repeatPassword, password, fieldTouched.repeatPassword]);

  const onSignUpPress = async () => {
    if (!isLoaded || !isFormValid()) return;

    setIsSubmitting(true);
    clearAllClerkErrors(setClerkErrors);

    try {
      const nameParts = full_name.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      setPendingVerification(true);
    } catch (err) {
      handleAuthError(err, "SIGNUP_ATTEMPT", {
        email: email,
        fullName: full_name,
        hasPassword: !!password,
      });

      const parsedError = parseClerkErrors(err);
      setClerkErrors(parsedError.fieldErrors);

      if (parsedError.toastMessage) {
        showError(parsedError.toastMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formContent = (
    <View style={styles.formContainer}>
      <CdText variant="title" size="large" style={styles.titleLarge}>
        {t("sign-up.sign-up")}
      </CdText>

      <CdTextInput
        ref={nameRef}
        placeholder={t("sign-up.first-and-last-name")}
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
          (fieldTouched.name && full_name.length >= 0 ? errors.name : null)
        }
        autoCapitalize="words"
        textContentType="name"
        autoComplete="name"
        returnKeyType="next"
        onSubmitEditing={() => emailRef.current?.focus()}
      />

      <CdTextInput
        ref={emailRef}
        placeholder={t("sign-up.email")}
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

      <CdTextInput
        ref={passwordRef}
        placeholder={t("sign-up.password")}
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
          placeholder={t("sign-up.repeat-password")}
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

      {password && (
        <PasswordRequirement
          password={password}
          repeatPassword={repeatPassword}
        />
      )}

      <TermsCheckbox isChecked={agreeToTerms} onToggle={setAgreeToTerms} />

      {/* Dev button to manually trigger email verification screen */}
      {isDev && !pendingVerification && (
        <CdButton
          title="[DEV] Skip to Email Verification"
          onPress={() => setPendingVerification(true)}
          variant="outline"
          size="medium"
          style={localStyles.devButton}
        />
      )}

      {!isKeyboardVisible && <DirectToSignIn />}
    </View>
  );

  let contentComponent = formContent;
  if (pendingVerification) {
    contentComponent = (
      <EmailVerification
        code={code}
        setCode={setCode}
        onVerificationSuccess={() => setIsSuccess(true)}
        userEmail={email}
      />
    );
  } else if (isSuccess) {
    contentComponent = <SignUpSuccess />;
  }

  const actionButtonTitle = isSubmitting
    ? t("sign-up.creating-account")
    : t("sign-up.sign-up");

  return (
    <LinearGradient
      colors={["#2B2B2B", "#151414"]}
      locations={[0, 0.6]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.container}>
        {/* SageIcon at the top - matching onboarding position */}
        {!isSubmitting && !isKeyboardVisible && (
          <View style={styles.topIconContainer}>
            <SageIcon status="pulsating" size={80} auto={false} />
          </View>
        )}

        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={0}
        >
          <View style={styles.container}>
            <View style={styles.form}>
              {isSubmitting ? (
                <View style={styles.centerContent}>
                  <SageIcon status="pulsating" size={200} />
                </View>
              ) : (
                contentComponent
              )}

              {!isKeyboardVisible && !pendingVerification && !isSuccess && (
                <View style={styles.actionButtonContainer}>
                  <CdButton
                    title={actionButtonTitle}
                    onPress={onSignUpPress}
                    variant="text"
                    size="large"
                    disabled={!isFormValid() || isSubmitting}
                  />
                </View>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>

        {/* CADENCE text at the bottom - matching onboarding position */}
        {!isSubmitting && (
          <CdText variant="title" size="large" style={styles.cadenceText}>
            CADENCE
          </CdText>
        )}

        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onHide={hideToast}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

export default SignUpScreen;

const localStyles = StyleSheet.create({
  devButton: {
    ...CONTAINER.size.width.full,
    marginTop: 16,
    backgroundColor: COLORS.semantic.warning,
    borderColor: COLORS.semantic.warning,
  },
});
