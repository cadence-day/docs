import useTranslation from "@/shared/hooks/useI18n";
import { useMemo, useState } from "react";
import { OnboardingPage } from "../types";

export function useOnboardingData() {
  const [currentPage, setCurrentPage] = useState(0);
  const { t } = useTranslation();

  const pages: OnboardingPage[] = useMemo(() => [
    {
      id: "welcome",
      type: "welcome",
      title: t("onboarding.welcome.title"),
      content: "",
      iconType: "onboarding",
    },
    {
      id: "activity-selection",
      type: "activity-selection",
      title: t("onboarding.activity-selection.title"),
      content: "",
      iconType: "onboarding",
      footer: t("onboarding.activity-selection.footer"),
      selectedActivities: [],
    },
    {
      id: "time-logging",
      type: "time-logging",
      title: t("onboarding.time-logging.title"),
      content: t("onboarding.time-logging.content"),
      iconType: "onboarding",
    },
    {
      id: "pattern-view",
      type: "pattern-view",
      title: t("onboarding.pattern-view.title"),
      content: "",
      iconType: "onboarding",
    },
    {
      id: "note-taking",
      type: "note-taking",
      title: t("onboarding.note-taking.title"),
      content: "",
      iconType: "onboarding",
      showMoodTracker: true,
    },
    {
      id: "notifications",
      type: "notifications",
      title: t("onboarding.notifications.title"),
      content: "",
      iconType: "onboarding",
      actionButton: {
        text: t("onboarding.notifications.button"),
        onPress: () => {},
      },
      notificationSchedule: [
        {
          label: t("onboarding.notifications.schedule.morning"),
          time: "8:00",
          enabled: true,
        },
        {
          label: t("onboarding.notifications.schedule.noon"),
          time: "12:00",
          enabled: true,
        },
        {
          label: t("onboarding.notifications.schedule.evening"),
          time: "19:00",
          enabled: true,
        },
      ],
    },
    {
      id: "final-animation",
      type: "final-animation",
      title: "",
      content: "",
      iconType: "sage",
    },
  ], [t]);

  const goToPage = (pageIndex: number) => {
    setCurrentPage(pageIndex);
  };

  return {
    currentPage,
    pages,
    goToPage,
    isLastPage: currentPage === pages.length - 1,
    totalPages: pages.length,
  };
}
