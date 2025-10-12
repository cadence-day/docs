import { CdButton, CdText, CdTextInput } from "@/shared/components/CadenceUI";
import Toast from "@/shared/components/Toast";
import SageIcon from "@/shared/components/icons/SageIcon";
import { COLORS } from "@/shared/constants/COLORS";
import { CONTAINER } from "@/shared/constants/CONTAINER";
import { isDev } from "@/shared/constants/isDev";
import { useToast } from "@/shared/hooks";
import { useI18n } from "@/shared/hooks/useI18n";
import { useSignIn } from "@clerk/clerk-expo";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  handleAuthError,
  isValidEmail,
  parseClerkErrors,
  validateEmailField,
} from "../../utils";
import { styles } from "../style";

const ForgotPasswordScreen = () => {
  const { t } = useI18n();
  const { isLoaded, signIn } = useSignIn();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [fieldTouched, setFieldTouched] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast, showError, showSuccess, hideToast } = useToast();

  // Keyboard visibility listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setIsKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setIsKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Real-time validation for touched field
  useEffect(() => {
    if (fieldTouched) {
      setEmailError(validateEmailField(email));
    }
  }, [email, fieldTouched]);

  const handleResetPassword = async () => {
    if (!isLoaded || !signIn) return;

    // Validate email first
    const emailValidationError = validateEmailField(email);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      setFieldTouched(true);
      return;
    }

    setIsSubmitting(true);
    setEmailError(null);

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });

      setEmailSent(true);
      showSuccess(
        t(
          "forgot-password.if-this-email-is-registered-a-reset-code-has-been-sent"
        )
      );

      // In dev mode, don't auto-navigate to allow user to manually test
      if (!isDev) {
        // Navigate to password reset screen after short delay
        setTimeout(() => {
          router.push({
            pathname: "/(auth)/password-reset",
            params: { email: email },
          });
        }, 2000);
      }
    } catch (err) {
      handleAuthError(err, "FORGOT_PASSWORD", {
        email: email,
        step: "initiate_reset",
      });

      // Parse Clerk errors - ensure err is not null/undefined
      if (err) {
        const parsedError = parseClerkErrors(err);

        if (parsedError.fieldErrors.email) {
          setEmailError(parsedError.fieldErrors.email);
        }

        if (parsedError.toastMessage) {
          showError(parsedError.toastMessage);
        } else {
          showError(
            t("forgot-password.an-unexpected-error-occurred-please-try-again")
          );
        }
      } else {
        showError(
          t("forgot-password.an-unexpected-error-occurred-please-try-again")
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return isValidEmail(email);
  };

  return (
    <LinearGradient
      colors={[COLORS.linearGradient.start, COLORS.linearGradient.end]}
      locations={[0, 0.6]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView
        style={styles.container}
        edges={["left", "right", "bottom"]}
      >
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
                <View style={styles.formContainer}>
                  <CdText
                    variant="title"
                    size="large"
                    style={styles.titleLarge}
                  >
                    {t("forgot-password.reset-password")}
                  </CdText>

                  <CdText
                    variant="body"
                    size="medium"
                    style={localStyles.subtitle}
                  >
                    {t(
                      "forgot-password.enter-your-email-and-well-send-you-a-link-to-reset-your-password"
                    )}
                  </CdText>
                  <CdTextInput
                    placeholder={t("forgot-password.email")}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      // Clear error when user starts typing
                      if (emailError) {
                        setEmailError(null);
                      }
                    }}
                    onBlur={() => setFieldTouched(true)}
                    error={fieldTouched ? emailError : null}
                    keyboardType="email-address"
                    textContentType="emailAddress"
                    autoComplete="email"
                    autoCapitalize="none"
                    returnKeyType="done"
                    onSubmitEditing={handleResetPassword}
                  />

                  <CdButton
                    title={t("forgot-password.send-reset-link")}
                    onPress={handleResetPassword}
                    variant="outline"
                    size="medium"
                    disabled={!isFormValid() || isSubmitting}
                    style={localStyles.submitButton}
                  />

                  {/* Dev button to navigate to password reset screen */}
                  {isDev && emailSent && (
                    <CdButton
                      title="[DEV] Go to Password Reset"
                      onPress={() => {
                        router.push({
                          pathname: "/(auth)/password-reset",
                          params: { email: email },
                        });
                      }}
                      variant="outline"
                      size="medium"
                      style={localStyles.devButton}
                    />
                  )}

                  <TouchableOpacity
                    onPress={() => router.back()}
                    style={localStyles.backLinkWrapper}
                  >
                    <CdText
                      variant="link"
                      size="medium"
                      style={localStyles.centerText}
                    >
                      {t("forgot-password.back-to-sign-in")}
                    </CdText>
                  </TouchableOpacity>
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

        {/* Toast Notification */}
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

export default ForgotPasswordScreen;

const localStyles = StyleSheet.create({
  subtitle: {
    marginBottom: 24,
    textAlign: "left",
  },
  submitButton: {
    ...CONTAINER.size.width.full,
    marginTop: 24,
  },
  devButton: {
    ...CONTAINER.size.width.full,
    marginTop: 16,
    backgroundColor: COLORS.semantic.warning,
    borderColor: COLORS.semantic.warning,
  },
  backLinkWrapper: {
    marginTop: 20,
  },
  centerText: {
    textAlign: "center",
  },
});
