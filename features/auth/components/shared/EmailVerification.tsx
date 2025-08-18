import { View, TouchableOpacity } from "react-native";
import CdText from "@/shared/components/CdText";
import CdTextInput from "@/shared/components/CdTextInput";
import CdButton from "@/shared/components/CdButton";
import { styles } from "../style";
import { router } from "expo-router";
import { useState } from "react";

const EmailVerification = ({ code, setCode }: { code: string, setCode: (code: string) => void }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onVerifyPress = async () => {
    setIsSubmitting(true);
    // TODO: Implement verification logic
    setIsSubmitting(false);
  };

  return (
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
        style={{ width: "100%", marginTop: 20 }}
      />

      <TouchableOpacity onPress={() => router.replace("/")}>
        <CdText variant="body" size="small" style={{ marginTop: 20, color: "#666" }}>← Back</CdText>
      </TouchableOpacity>
    </View>
  );
};

export default EmailVerification;

