import { useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useSignUp } from "@clerk/clerk-expo";
import CdText from "@/shared/components/CdText";
import CdTextInput from "@/shared/components/CdTextInput";
import CdButton from "@/shared/components/CdButton";
import { styles } from "../style";

interface EmailVerificationProps {
  code: string;
  setCode: (code: string) => void;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({ 
  code, 
  setCode 
}) => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      } else {
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.centerContent}>
      <CdText variant="title" size="large" style={styles.title}>
        Verify your email
      </CdText>
      
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
        style={{ width: "100%", marginTop: 20 }}
      />

      <TouchableOpacity onPress={() => router.replace("/")}>
        <CdText variant="body" size="small" style={{ marginTop: 20, color: "#666" }}>
          ← Back
        </CdText>
      </TouchableOpacity>
    </View>
  );
};

export default EmailVerification;

