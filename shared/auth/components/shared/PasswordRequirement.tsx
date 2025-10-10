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

  // Define all requirements with their validation checks
  const requirements = [
    {
      text: `${t("the-password-should-be-at-least")} ${PASSWORD_REQUIREMENTS.MIN_LENGTH} characters.`,
      isMet: password.length >= PASSWORD_REQUIREMENTS.MIN_LENGTH,
    },
    PASSWORD_REQUIREMENTS.REQUIRE_LOWERCASE && {
      text: t("contain-one-lowercase-letter"),
      isMet: /[a-z]/.test(password),
    },
    PASSWORD_REQUIREMENTS.REQUIRE_UPPERCASE && {
      text: t("contain-one-uppercase-letter"),
      isMet: /[A-Z]/.test(password),
    },
    PASSWORD_REQUIREMENTS.REQUIRE_NUMBER && {
      text: t("contain-one-digit"),
      isMet: /[0-9]/.test(password),
    },
    PASSWORD_REQUIREMENTS.REQUIRE_SPECIAL_CHAR && {
      text: t("contain-one-special-character"),
      isMet: /[!@#$%^&*()_+\-=[\]{};':"\\|<>?,./`~]/.test(password),
    },
    {
      text: t("passwords-should-match"),
      isMet: password === repeatPassword && password.length > 0,
    },
  ].filter(Boolean); // Remove any false entries from conditional requirements

  // Find the first unmet requirement
  const firstUnmetRequirement = requirements.find((req) => !req.isMet);

  // If all requirements are met, don't render anything
  if (!firstUnmetRequirement) {
    return null;
  }

  return (
    <View style={styles.passwordRequirements}>
      <Text style={styles.requirementText}>
        {firstUnmetRequirement.text}
      </Text>
    </View>
  );
};

export default PasswordRequirement;
