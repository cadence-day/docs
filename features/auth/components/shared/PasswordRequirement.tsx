import React from "react";
import { View, Text } from "react-native";
import { styles } from "../style";

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
    </View>
  );
};

export default PasswordRequirement;
