import { useTranslation } from "react-i18next";
import { normalizeLocale } from "@/shared/utils/locale";

export const useI18n = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (language: string) => {
    // Normalize the language tag before setting it
    const normalizedLanguage = normalizeLocale(language);
    i18n.changeLanguage(normalizedLanguage);
  };

  const getCurrentLanguage = () => {
    return i18n.language;
  };

  const getSupportedLanguages = () => {
    return [
      { code: "en", name: "English", nativeName: "English" },
      { code: "dk", name: "Danish", nativeName: "Dansk" },
      { code: "fr", name: "French", nativeName: "Français" },
      { code: "de", name: "German", nativeName: "Deutsch" },
      { code: "ru", name: "Russian", nativeName: "Русский" },
    ];
  };

  return {
    t,
    changeLanguage,
    getCurrentLanguage,
    getSupportedLanguages,
    i18n,
  };
};

export default useI18n;
