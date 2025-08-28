import { useI18n } from "@/shared/hooks/useI18n";
import React from "react";
import { Text, View } from "react-native";
import { PASSWORD_REQUIREMENTS } from "../../utils/constants";
import { styles } from "../style";

interface PasswordRequirementProps {
  password: string;
  repeatPassword: string;
}

const PasswordRequirement: React.FC<PasswordRequirementProps> = ({
  password,
  repeatPassword,
}) => {
  const { t } = useI18n();
  return (
    <View style={styles.passwordRequirements}>
      <Text
        style={[
          styles.requirementText,
          password.length >= PASSWORD_REQUIREMENTS.MIN_LENGTH &&
            styles.requirementMet,
        ]}
      >
        {t("the-password-should-be-at-least")}{" "}
        {PASSWORD_REQUIREMENTS.MIN_LENGTH} characters.
      </Text>

      {PASSWORD_REQUIREMENTS.REQUIRE_LOWERCASE && (
        <Text
          style={[
            styles.requirementText,
            /[a-z]/.test(password) && styles.requirementMet,
          ]}
        >
          {t("contain-one-lowercase-letter")}
        </Text>
      )}

      {PASSWORD_REQUIREMENTS.REQUIRE_UPPERCASE && (
        <Text
          style={[
            styles.requirementText,
            /[A-Z]/.test(password) && styles.requirementMet,
          ]}
        >
          {t("contain-one-uppercase-letter")}
        </Text>
      )}

      {PASSWORD_REQUIREMENTS.REQUIRE_NUMBER && (
        <Text
          style={[
            styles.requirementText,
            /[0-9]/.test(password) && styles.requirementMet,
          ]}
        >
          {t("contain-one-digit")}
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
          t('contain-one-special-character')
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
        {t("passwords-should-match")}
      </Text>
    </View>
  );
};

export default PasswordRequirement;
