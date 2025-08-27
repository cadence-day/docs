import { useTranslation } from "react-i18next";

export const useI18n = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (language: string) => {
    // Normalize the language tag before setting it
    // We only use 2-letter language codes for app languages (e.g. 'en', 'fr', 'da')
    const code = language.split(/[-_]/)[0];
    i18n.changeLanguage(code);
  };

  const getCurrentLanguage = () => {
    const lang = i18n.language || "en";
    return String(lang).split(/[-_]/)[0].toLowerCase();
  };

  const getSupportedLanguages = () => {
    return [
      { code: "en", name: "English", nativeName: "English" },
      { code: "da", name: "Danish", nativeName: "Dansk" },
      { code: "fr", name: "French", nativeName: "Français" },
      { code: "de", name: "German", nativeName: "Deutsch" },
      { code: "es", name: "Spanish", nativeName: "Español" },
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
