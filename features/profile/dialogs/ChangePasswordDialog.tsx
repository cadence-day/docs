import { CdTextInput } from "@/shared/components/CadenceUI";
import { useToast } from "@/shared/hooks";
import useI18n from "@/shared/hooks/useI18n";
import useDialogStore from "@/shared/stores/useDialogStore";
import { useSignIn } from "@clerk/clerk-expo";
import React, { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { profileStyles } from "../styles";

interface ChangePasswordDialogProps {}

export const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({
  _dialogId,
}: any) => {
  const { t } = useI18n();
  const closeDialog = useDialogStore((s) => s.closeDialog);
  const { isLoaded, signIn } = useSignIn();
  const { showSuccess, showError } = useToast();

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async () => {
    if (!email.trim()) {
      Alert.alert(t("common.error"), t("forgot-password.email"));
      return;
    }

    if (!isLoaded || !signIn) {
      showError(t("common.error"));
      return;
    }

    setIsSubmitting(true);
    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email.trim(),
      });

      showSuccess(t("password-reset.verification-code-sent-check-your-email"));
      if (_dialogId) closeDialog(_dialogId);
    } catch (err: any) {
      // Clerk errors are handled elsewhere; show a simple toast
      showError(
        err?.message ||
          t("password-reset.failed-to-reset-password-please-try-again")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={profileStyles.supportFormContainer}>
      <Text style={profileStyles.fieldLabel}>{t("forgot-password.email")}</Text>
      <CdTextInput
        placeholder={t("forgot-password.email")}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!isSubmitting}
      />

      <TouchableOpacity
        style={[
          profileStyles.submitButton,
          isSubmitting && profileStyles.submitButtonDisabled,
        ]}
        onPress={onSubmit}
        disabled={isSubmitting}
      >
        <Text style={profileStyles.submitButtonText}>
          {isSubmitting
            ? t("common.submitting")
            : t("forgot-password.reset-password")}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ChangePasswordDialog;
