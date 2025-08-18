import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface PasswordRequirementProps {
  password: string;
  repeatPassword: string;
}

const PasswordRequirement: React.FC<PasswordRequirementProps> = ({
  password,
  repeatPassword,
}) => {
  return (
    <View style={styles.passwordRequirements}>
      <Text
        style={[
          styles.requirementText,
          password.length >= 10 && styles.requirementMet,
        ]}
      >
        The password should be at least 10 characters.
      </Text>
      <Text
        style={[
          styles.requirementText,
          /[a-z]/.test(password) && styles.requirementMet,
        ]}
      >
        Contain one lowercase letter.
      </Text>
      <Text
        style={[
          styles.requirementText,
          /[A-Z]/.test(password) && styles.requirementMet,
        ]}
      >
        Contain one uppercase letter.
      </Text>
      <Text
        style={[
          styles.requirementText,
          /[0-9]/.test(password) && styles.requirementMet,
        ]}
      >
        Contain one digit.
      </Text>
      <Text
        style={[
          styles.requirementText,
          /[!@#$%^&*()_+\-=[\]{};':"\\|<>?,./`~]/.test(password) &&
            styles.requirementMet,
        ]}
      >
        Contain one special character.
      </Text>

      <Text
        style={[
          styles.requirementText,
          password === repeatPassword &&
            password.length > 0 &&
            styles.requirementMet,
        ]}
      >
        Passwords should match.
      </Text>
      
      <View style={{ height: 20 }} />
      
      <Text style={styles.termsText}>
        By signing up, you agree to our{" "}
        <Text style={styles.link}>Terms and Conditions</Text> and{" "}
        <Text style={styles.link}>Privacy Policy</Text>.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  passwordRequirements: {
    width: "100%",
    marginTop: 8,
    marginBottom: 20,
  },
  requirementText: {
    color: "#ff6b6b",
    fontSize: 12,
    marginTop: 4,
    marginBottom: 4,
  },
  requirementMet: {
    color: "#4CAF50",
  },
  termsText: {
    color: "#B9B9B9",
    fontSize: 12,
    textAlign: "left",
    lineHeight: 18,
  },
  link: {
    textDecorationLine: "underline",
    color: "#FFFFFF",
    fontSize: 12,
    marginBottom: 6,
  },
});

export default PasswordRequirement;
