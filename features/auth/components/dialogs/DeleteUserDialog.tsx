import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../hooks/useAuth";
import AuthDialog from "../shared/AuthDialog";
import { useI18n } from "@/shared/hooks/useI18n";
import { useAuthErrorHandler } from "../../utils/errorHandler";
import authDialogStyles from "../shared/authDialogStyles";

interface DeleteUserDialogProps {
  visible: boolean;
  onClose: () => void;
}

const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({
  visible,
  onClose,
}) => {
  const { t } = useI18n();
  const { showAuthError } = useAuthErrorHandler();
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteAccount } = useAuth();

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      onClose();
      Alert.alert(t("auth.accountDeleted"), t("auth.accountDeletedMessage"));
    } catch (error: any) {
      showAuthError(error, "Delete Account");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AuthDialog
      visible={visible}
      onClose={onClose}
      title={t("auth.deleteAccount")}
      showCloseButton={true}
      enableCloseOnBackgroundPress={false}
      showSageIcon={false}>
      <View style={authDialogStyles.iconContainer}>
        <Ionicons name="warning" size={64} color="#EF4444" />
      </View>
      <Text style={authDialogStyles.subtitle}>
        {t("auth.deleteAccountWarning")}
      </Text>
      <View style={authDialogStyles.warningBox}>
        <Ionicons name="alert-circle" size={20} color="#DC2626" />
        <Text style={authDialogStyles.warningText}>
          {t("auth.deleteAccountDetails")}
        </Text>
      </View>

      <View style={authDialogStyles.buttonContainer}>
        <TouchableOpacity
          style={authDialogStyles.cancelButton}
          onPress={onClose}
          disabled={isDeleting}>
          <Text style={authDialogStyles.cancelButtonText}>
            {t("common.cancel")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            authDialogStyles.deleteButton,
            isDeleting && authDialogStyles.disabledButton,
          ]}
          onPress={handleDeleteAccount}
          disabled={isDeleting}>
          {isDeleting ? (
            <View style={authDialogStyles.loadingContainer}>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={authDialogStyles.deleteButtonText}>
                {t("auth.deleting")}
              </Text>
            </View>
          ) : (
            <Text style={authDialogStyles.deleteButtonText}>
              {t("auth.deleteForever")}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </AuthDialog>
  );
};

export default DeleteUserDialog;
