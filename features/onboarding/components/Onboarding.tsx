import useTranslation from "@/shared/hooks/useI18n";
import React, { forwardRef, useImperativeHandle, useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useOnboardingData } from "../hooks/useOnboardingData";
import { useOnboardingActions } from "../hooks/useOnboardingActions";
import { useOnboardingPage } from "../hooks/useOnboardingPage";
import { OnboardingDialogProps, OnboardingDialogHandle } from "../types";
import { onboardingStyles as styles } from "../styles";
import { OnboardingPageIndicators, OnboardingIcon, SageIconContainer } from "./ui";


export const OnboardingDialog = forwardRef<
  OnboardingDialogHandle,
  OnboardingDialogProps
>(({ confirm, headerProps: _headerProps, _dialogId }, ref) => {
  const { currentPage, pages, goToPage, isLastPage } = useOnboardingData();
  const { handleNotificationPermission, handlePrivacyPolicy, handleComplete } = useOnboardingActions();
  const { t } = useTranslation();

  const currentPageData = useOnboardingPage(pages, currentPage, handleNotificationPermission, handlePrivacyPolicy);

  const renderIcon = () => {
    if (currentPageData.iconType === "onboarding") {
      return <OnboardingIcon />;
    }
    if (currentPageData.iconType === "sage") {
      return <SageIconContainer />;
    }
    return null;
  };

  const handleConfirm = () => {
    handleComplete(confirm, _dialogId);
  };

  // Store the current page in dialog props so DialogHost can read it
  useEffect(() => {
    try {
      const useDialogStore = require("@/shared/stores/useDialogStore").default;
      if (_dialogId)
        useDialogStore.getState().setDialogProps(_dialogId, { currentPage });
    } catch {
      // ignore
    }
  }, [currentPage, _dialogId]);

  useImperativeHandle(ref, () => ({
    confirm: handleConfirm,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        {currentPageData.iconType && (
          <View style={styles.iconContainer}>
            {renderIcon()}
          </View>
        )}
        <Text style={styles.title}>{currentPageData.title}</Text>
        <Text style={styles.content}>{currentPageData.content}</Text>

        {currentPageData.linkText && (
          <TouchableOpacity
            style={styles.linkButton}
            onPress={currentPageData.linkText.onPress}
          >
            <Text style={styles.linkText}>
              {currentPageData.linkText.text}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {currentPageData.actionButton && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={currentPageData.actionButton.onPress}
        >
          <Text style={styles.actionButtonText}>
            {currentPageData.actionButton.text}
          </Text>
        </TouchableOpacity>
      )}

      {currentPageData.footer && (
        <Text style={styles.footerText}>{currentPageData.footer}</Text>
      )}

      <TouchableOpacity
        style={styles.continueButton}
        onPress={() => {
          if (!isLastPage) {
            goToPage(currentPage + 1);
          } else {
            handleConfirm();
          }
        }}
      >
        <Text style={styles.continueButtonText}>{t("continue")}</Text>
      </TouchableOpacity>

      <OnboardingPageIndicators
        totalPages={pages.length}
        currentPage={currentPage}
        onPagePress={goToPage}
      />
    </View>
  );
});


export default OnboardingDialog;
