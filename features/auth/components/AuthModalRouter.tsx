import React from "react";
import { Modal, StyleSheet } from "react-native";
import { useAuth } from "../hooks/useAuth";
import { useAuthStore } from "../hooks/useAuthStore";

// Import auth components
import LoginDialog from "./dialogs/LoginDialog";
import SignupDialog from "./dialogs/SignupDialog";
import ResetPasswordDialog from "./dialogs/ResetPasswordDialog";
import EmailConfirmationDialog from "./dialogs/EmailConfirmationDialog";

const AuthModalRouter: React.FC = () => {
  const {
    user,
    isLoading,
    login,
    signup,
    resetPassword,
    showModal,
    hideModal,
  } = useAuth();
  const { modalRoute, pendingConfirmationEmail } = useAuthStore();
  // Always return to "login" if no initial session is found.

  // Don't render anything if user is authenticated
  if (user) {
    return null;
  }

  // Show login modal by default if no specific route
  const currentRoute = modalRoute || "login";

  // Set the default route if none is set
  React.useEffect(() => {
    if (!modalRoute) {
      showModal("login");
    }
  }, [modalRoute, showModal]);

  const renderModalContent = () => {
    switch (currentRoute) {
      case "login":
        return (
          <LoginDialog
            onClose={hideModal}
            onLogin={(email, password) => login(email, password)}
            onSwitchToSignup={() => showModal("signup")}
            onSwitchToResetPassword={() => showModal("reset-password")}
            isLoading={isLoading}
          />
        );
      case "signup":
        return (
          <SignupDialog
            onClose={hideModal}
            onSignup={(data) => signup(data)}
            onSwitchToLogin={() => showModal("login")}
            isLoading={isLoading}
          />
        );
      case "reset-password":
        return (
          <ResetPasswordDialog
            onClose={hideModal}
            onResetPassword={(email) => resetPassword(email)}
            onSwitchToLogin={() => showModal("login")}
            isLoading={isLoading}
          />
        );
      case "email-confirmation":
        return (
          <EmailConfirmationDialog
            onClose={hideModal}
            onSwitchToLogin={() => showModal("login")}
            isLoading={isLoading}
            userEmail={pendingConfirmationEmail || undefined}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Modal visible={true} transparent={true} onRequestClose={hideModal}>
      {renderModalContent()}
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
});

export default AuthModalRouter;
