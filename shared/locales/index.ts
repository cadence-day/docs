import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import da from "./da.json";
import de from "./de.json";
import en from "./en.json";
import es from "./es.json";
import fr from "./fr.json";
import { GlobalErrorHandler } from "../utils/errorHandler";

export const resources = {
  en: { translation: en },
  fr: { translation: fr },
  de: { translation: de },
  da: { translation: da },
  es: { translation: es },
};

export const fallbackLng = "en";

export const availableLanguages = ["en", "fr", "de", "da", "es"];

export function detectDeviceLanguage() {
  const locales = Localization.getLocales();
  const primary = locales && locales.length > 0 ? locales[0] : null;
  // Prefer languageTag (e.g. 'en-US'), fall back to languageCode
  const tag = primary?.languageTag || primary?.languageCode || fallbackLng;
  const code = String(tag).split(/[-_]/)[0].toLowerCase();
  return availableLanguages.includes(code) ? code : fallbackLng;
}

export function initI18n() {
  i18n.use(initReactI18next).init({
    resources,
    lng: detectDeviceLanguage(),
    fallbackLng,
    ns: ["translation"],
    defaultNS: "translation",
    interpolation: { escapeValue: false },
  });
  // Ensure the resolved language is applied (helps when detection logic changes)
  const detected = detectDeviceLanguage();
  if (i18n.language !== detected) {
    i18n.changeLanguage(detected);
  }
  return i18n;
}

export default i18n;

// Ensure i18n is initialized once when this module is imported.
if (!i18n.isInitialized) {
  try {
    // Initialize synchronously; i18next will handle async loading if needed.
    initI18n();
  } catch (err) {
    // Log initialization errors; components may still mount and use the provider.
    // eslint-disable-next-line no-console
    GlobalErrorHandler.logWarning(
      "i18n initialization failed",
      "I18N_INIT_ERROR",
      { error: err }
    );
  }
}

// Export locale in the right format for other modules to use
export const locale = i18n.language || fallbackLng;

// Listen for language changes and update locale export
i18n.on("languageChanged", (lng) => {
  // Update exported locale variable
  // Note: This won't update existing imports; they need to re-import or use i18n directly.
  // This is a limitation of module exports in JavaScript/TypeScript.
  // eslint-disable-next-line no-console
  GlobalErrorHandler.logWarning(
    "i18n language changed",
    "I18N_LANGUAGE_CHANGE",
    { language: lng }
  );
});
