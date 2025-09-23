import useTranslation from "@/shared/hooks/useI18n";

export function useOnboardingIcons() {
  const { t } = useTranslation();

  const getIconType = (pageTitle: string): "onboarding" | "sage" | null => {
    if (pageTitle === t("welcome-to-cadence")) {
      return "onboarding";
    }
    if (pageTitle === t("meet-sage")) {
      return "sage";
    }
    return null;
  };

  return {
    getIconType,
  };
}