import { CdButton, CdText, CdTextInput } from "@/shared/components/CadenceUI";
import Toast from "@/shared/components/Toast";
import SageIcon from "@/shared/components/icons/SageIcon";
import { COLORS } from "@/shared/constants/COLORS";
import { useToast } from "@/shared/hooks";
import { useI18n } from "@/shared/hooks/useI18n";
import { useSignIn } from "@clerk/clerk-expo";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
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
  const { toast, showError, showSuccess, hideToast } = useToast();

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

      showSuccess(
        t(
          "forgot-password.if-this-email-is-registered-a-reset-code-has-been-sent"
        )
      );
      // Navigate to password reset screen after short delay
      setTimeout(() => {
        router.push({
          pathname: "/(auth)/password-reset",
          params: { email: email },
        });
      }, 2000);
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
      <View style={styles.form}>
        {isSubmitting ? (
          <View style={styles.centerContent}>
            <SageIcon status="pulsating" size={200} />
          </View>
        ) : (
          <View style={styles.formContainer}>
            <CdText variant="title" size="large" style={styles.title}>
              {t("forgot-password.reset-password")}
            </CdText>

            <CdText
              variant="body"
              size="medium"
              style={{ marginBottom: 24, textAlign: "center" }}
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

            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginTop: 20 }}
            >
              <CdText
                variant="link"
                size="medium"
                style={{ textAlign: "center" }}
              >
                {t("forgot-password.back-to-sign-in")}
              </CdText>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.actionButtonContainer}>
          <CdButton
            title={t("forgot-password.send-reset-link")}
            onPress={handleResetPassword}
            variant="text"
            size="large"
            disabled={!isFormValid() || isSubmitting}
          />
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

export default ForgotPasswordScreen;
