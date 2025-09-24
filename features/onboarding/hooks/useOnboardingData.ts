import { useState, useMemo } from "react";
import useTranslation from "@/shared/hooks/useI18n";
import { OnboardingPage } from "../types";

export function useOnboardingData() {
  const [currentPage, setCurrentPage] = useState(0);
  const { t } = useTranslation();

  const pages: OnboardingPage[] = useMemo(() => [
    {
      title: t("welcome-to-cadence"),
      content: t("time-moves-fast-cadence-helps"),
    },
    {
      title: t("expand-your-memory"),
      content: t("ever-wonder-what-you-did-last"),
    },
    {
      title: t("stay-in-sync-nwith-your-time"),
      content: t("turn-on-notifications-for-gent"),
    },
    {
      title: t("meet-sage"),
      content: t("sage-your-friendly-ai-guide-wi"),
    },
    {
      title: t("your-data-nyour-privacy"),
      content: t("your-time-is-yours-alone-every"),
    },
    {
      title: t("make-cadence-yours"),
      content: t("cadence-starts-with-universal"),
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