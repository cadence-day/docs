import React from "react";
import {
  View,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  useWindowDimensions,
} from "react-native";
import DynamicDialog from "@/shared/components/ui/DynamicDialog";
import SageIcon from "@/shared/components/icons/SageIcon";
import authDialogStyles from "./authDialogStyles";

export interface AuthDialogProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  rightActionElement?: React.ReactNode;
  onRightAction?: () => void;
  isRightActionButton?: boolean;
  showCloseButton?: boolean;
  enableCloseOnBackgroundPress?: boolean;
  enableDragging?: boolean;
  showSageIcon?: boolean;
  sageIconSize?: number;
  sageIconStatus?: "pulsating" | "idle";
  bottomBorder?: boolean;
}

const AuthDialog: React.FC<AuthDialogProps> = ({
  visible,
  onClose,
  title,
  children,
  rightActionElement,
  onRightAction,
  isRightActionButton,
  showCloseButton = true,
  enableCloseOnBackgroundPress = false,
  enableDragging = false,
  showSageIcon = true,
  sageIconSize = 100,
  sageIconStatus = "pulsating",
  bottomBorder = false,
}) => {
  const { height: windowHeight } = useWindowDimensions();
  // iPhone SE (2020/2022) height is 667, iPhone 16/16 Plus/Pro/Pro Max are 852/932/1000+ px
  // We'll hide SageIcon if height < 700 (SE and similar), show otherwise
  const shouldShowSageIcon = showSageIcon && windowHeight >= 700;

  return (
    <DynamicDialog
      visible={visible}
      onClose={onClose}
      showCloseButton={showCloseButton}
      enableCloseOnBackgroundPress={enableCloseOnBackgroundPress}
      enableDragging={enableDragging}
      headerProps={{
        title,
        bottomBorder,
        rightActionElement,
        onRightAction,
        isRightActionButton,
      }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={authDialogStyles.content}
          keyboardShouldPersistTaps="handled">
          {shouldShowSageIcon && (
            <View style={authDialogStyles.header}>
              <SageIcon
                size={sageIconSize}
                status={sageIconStatus}
                auto={false}
              />
            </View>
          )}
          <View style={authDialogStyles.form}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </DynamicDialog>
  );
};

export default AuthDialog;
