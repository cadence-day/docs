import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { View } from "react-native";
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
import { styles } from "../style";
import DirectToSignIn from "../shared/DirectToSignIn";

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
          <EmailVerification code={code} setCode={setCode} />
        ) : isSuccess ? (
          <SignUpSuccess />
        ) : (
          <View style={styles.formContainer}>
            <CdText variant="title" size="large" style={styles.title}>
              Sign up
            </CdText>
            
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
                <CdText variant="error" size="medium" style={styles.passwordMismatchText}>
                  {passwordError}
                </CdText>
              )}

            {/* Password Requirements */}
            <PasswordRequirement 
              password={password}
              repeatPassword={repeatPassword}
            />

            <TermsAndPrivacy />
            <DirectToSignIn />
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

export default SignUpScreen;
