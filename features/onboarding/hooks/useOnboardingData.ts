import useTranslation from "@/shared/hooks/useI18n";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import * as Notifications from "expo-notifications";
import { useEffect, useMemo, useState } from "react";
import { OnboardingPage } from "../types";
import { useNotificationActions } from "./useNotificationActions";

export function useOnboardingData() {
  const [currentPage, setCurrentPage] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const { t } = useTranslation();

  const { handleNotificationPermission } = useNotificationActions();

  // Check if notifications are already enabled
  useEffect(() => {
    const checkNotificationStatus = async () => {
      try {
        const { status } = await Notifications.getPermissionsAsync();
        setNotificationsEnabled(status === "granted");
      } catch (error) {
        setNotificationsEnabled(false);
        GlobalErrorHandler.logError(
          error,
          "CHECK_NOTIFICATION_PERMISSION",
        );
      }
    };
    checkNotificationStatus();
  }, []);

  const pages: OnboardingPage[] = useMemo(() => {
    const basePages: OnboardingPage[] = [
      {
        id: "welcome",
        type: "welcome",
        title: t("onboarding.welcome.title"),
      },
      {
        id: "activity-selection",
        type: "activity-selection",
        title: t("onboarding.activity-selection.title"),
        content: t("onboarding.activity-selection.content"),
        footer: t("onboarding.activity-selection.footer"),
      },
      {
        id: "time-logging",
        type: "time-logging",
        title: t("onboarding.time-logging.title"),
      },
      {
        id: "pattern-view",
        type: "pattern-view",
        title: t("onboarding.pattern-view.title"),
      },
      {
        id: "note-taking",
        type: "note-taking",
        title: t("onboarding.note-taking.title"),
      },
    ];

    // Only include notifications screen if not already enabled
    if (!notificationsEnabled) {
      basePages.push({
        id: "notifications",
        type: "notifications",
        title: t("onboarding.notifications.title"),
        actionButton: {
          text: t("onboarding.notifications.button"),
          onPress: handleNotificationPermission,
        },
      });
    }

    basePages.push({
      id: "final-animation",
      type: "final-animation",
      title: "",
    });

    return basePages;
  }, [t, handleNotificationPermission, notificationsEnabled]);

  const goToPage = (pageIndex: number) => {
    setCurrentPage(pageIndex);
  };

  const currentPageData = pages[currentPage];

  if (!currentPageData) {
    throw new Error(
      `Invalid current page index: ${currentPage} (total pages: ${pages.length})`,
    );
  }

  return {
    currentPage,
    currentPageData,
    pages,
    goToPage,
    isLastPage: currentPage === pages.length - 1,
    totalPages: pages.length,
  };
}
