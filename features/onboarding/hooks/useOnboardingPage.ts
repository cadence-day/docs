import useTranslation from "@/shared/hooks/useI18n";
import { OnboardingPage } from "../types";
import { useOnboardingIcons } from "./useOnboardingIcons";

export function useOnboardingPage(
  pages: OnboardingPage[],
  currentPage: number,
  handleNotificationPermission: () => void,
  handlePrivacyPolicy: () => void
) {
  const { t } = useTranslation();
  const { getIconType } = useOnboardingIcons();
  const page = pages[currentPage];

  // Enhance the current page with dynamic actions
  const currentPageData: OnboardingPage = {
    ...page,
    actionButton: page.title === t("stay-in-sync-nwith-your-time") ? {
      text: t("allow-notifications"),
      onPress: handleNotificationPermission,
    } : page.actionButton,
    linkText: page.title === t("your-data-nyour-privacy") ? {
      text: t("read-more-about-how-we-protect"),
      onPress: handlePrivacyPolicy,
    } : page.linkText,
  };

  const iconType = getIconType(page.title);

  return {
    ...currentPageData,
    iconType,
  };
}