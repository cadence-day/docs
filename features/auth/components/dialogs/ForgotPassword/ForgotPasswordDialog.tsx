import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useClerk } from "@clerk/clerk-expo";
import DynamicDialog from "@/shared/components/ui/DynamicDialog";
import CdTextInput from "@/shared/components/CdTextInput";
import CdButton from "@/shared/components/CdButton";
import CdText from "@/shared/components/CdText";

interface ForgotPasswordDialogProps {
  visible: boolean;
  onClose: () => void;
}

const ForgotPasswordDialog: React.FC<ForgotPasswordDialogProps> = ({
  visible,
  onClose,
}) => {
  const { client } = useClerk();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const resetValues = () => {
    setEmail("");
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleResetPassword = async () => {
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");
    
    try {
      await client.signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      setSuccessMessage(
        "If this email is registered, a reset link has been sent."
      );
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    resetValues();
    onClose();
  };

  return (
    <DynamicDialog
      visible={visible}
      onClose={handleCloseDialog}
      height={84}
      maxHeight={84}
      headerProps={{
        title: "Forgot Password",
        rightActionElement: "Close",
        onRightAction: handleCloseDialog,
      }}      

    >
      <View style={styles.form}>
        <CdText variant="body" size="medium" style={styles.description}>
          Enter your email and we will send you a link to reset your password.
        </CdText>
        <CdTextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />
       
        {successMessage && (
          <Text style={styles.messageText}>{successMessage}</Text>
        )}
        {errorMessage && (
          <Text style={styles.errorText}>{errorMessage}</Text>
        )}
        <View style={styles.buttonContainer}>
          <CdButton
            title="Get Reset Link"
            onPress={handleResetPassword}
            variant="text"
            size="large"
          />
        </View>
      </View>
    </DynamicDialog>
  );
};

const styles = StyleSheet.create({
  form: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#B9B9B9",
    marginBottom: 24,
    textAlign: "left",
    lineHeight: 22,
  },
  input: {
    borderWidth: 1,
    borderColor: "#FFFFFF",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 24,
    backgroundColor: "transparent",
  },
  resetButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  resetButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  link: {
    textDecorationLine: "underline",
  },
  messageText: {
    color: "white",
    marginTop: 8,
    textAlign: "center",
  },
  errorText: {
    color: "white",
    marginTop: 8,
    textAlign: "center",
  },
  buttonContainer: {
    bottom: 30,
    left: 0,
    right: 0,
    marginTop: 50,
    alignItems: "center",
  },
});

export default ForgotPasswordDialog;
