import React from "react";
import { Text, View } from "react-native";
import { styles } from "../style";
import { PASSWORD_REQUIREMENTS } from "./constants";

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
          password.length >= PASSWORD_REQUIREMENTS.MIN_LENGTH &&
            styles.requirementMet,
        ]}
      >
        - The password should be at least {PASSWORD_REQUIREMENTS.MIN_LENGTH}{" "}
        characters.
      </Text>

      {PASSWORD_REQUIREMENTS.REQUIRE_LOWERCASE && (
        <Text
          style={[
            styles.requirementText,
            /[a-z]/.test(password) && styles.requirementMet,
          ]}
        >
          - Contain one lowercase letter.
        </Text>
      )}

      {PASSWORD_REQUIREMENTS.REQUIRE_UPPERCASE && (
        <Text
          style={[
            styles.requirementText,
            /[A-Z]/.test(password) && styles.requirementMet,
          ]}
        >
          - Contain one uppercase letter.
        </Text>
      )}

      {PASSWORD_REQUIREMENTS.REQUIRE_NUMBER && (
        <Text
          style={[
            styles.requirementText,
            /[0-9]/.test(password) && styles.requirementMet,
          ]}
        >
          - Contain one digit.
        </Text>
      )}

      {PASSWORD_REQUIREMENTS.REQUIRE_SPECIAL_CHAR && (
        <Text
          style={[
            styles.requirementText,
            /[!@#$%^&*()_+\-=[\]{};':"\\|<>?,./`~]/.test(password) &&
              styles.requirementMet,
          ]}
        >
          - Contain one special character.
        </Text>
      )}

      <Text
        style={[
          styles.requirementText,
          password === repeatPassword &&
            password.length > 0 &&
            styles.requirementMet,
        ]}
      >
        - Passwords should match.
      </Text>
    </View>
  );
};

export default PasswordRequirement;
