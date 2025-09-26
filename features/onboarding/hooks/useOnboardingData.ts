import useTranslation from "@/shared/hooks/useI18n";
import { useMemo, useState } from "react";
import { OnboardingPage } from "../types";
import { useNotificationActions } from "./useNotificationActions";

export function useOnboardingData() {
  const [currentPage, setCurrentPage] = useState(0);
  const { t } = useTranslation();

  const { handleNotificationPermission } = useNotificationActions();

  const pages: OnboardingPage[] = useMemo(() => [
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
    {
      id: "notifications",
      type: "notifications",
      title: t("onboarding.notifications.title"),
      actionButton: {
        text: t("onboarding.notifications.button"),
        onPress: handleNotificationPermission,
      },
    },
    {
      id: "final-animation",
      type: "final-animation",
      title: "",
    },
  ], [t, handleNotificationPermission]);

  const goToPage = (pageIndex: number) => {
    setCurrentPage(pageIndex);
  };

  const currentPageData = pages[currentPage];

  if (!currentPageData) {
    throw new Error("Invalid current page index");
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
