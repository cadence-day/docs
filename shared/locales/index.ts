import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import da from "./da.json";
import de from "./de.json";
import en from "./en.json";
import es from "./es.json";
import fr from "./fr.json";

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
    console.warn("i18n initialization failed:", err);
  }
}
