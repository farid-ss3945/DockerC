import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/translationEN.json";
import az from "./locales/translationAZ.json";
import ru from "./locales/translationRU.json";

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      az: { translation: az },
      ru: { translation: ru },
    },
    lng: "ru", // default language is Russian
    fallbackLng: "ru",
    interpolation: { escapeValue: false },
  });

/**
 * Translate a dynamic field (like product name, description)
 * Only translates AZ → EN, never EN → AZ
 */
export async function translateDynamicField(text, targetLang) {
  // If language is AZ (default), no translation needed
  if (targetLang === "az") return text;

  const key = `dynamic.${text}`;

  // Return cached translation if exists
  if (i18n.exists(key, { lng: targetLang })) {
    return i18n.t(key, { lng: targetLang });
  }

  try {
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=AIzaSyBtKQP7GgLife1m73GxLPx9t5m6Xmf5mUc`,
      {
        method: "POST",
        body: JSON.stringify({ q: text, target: targetLang }),
        headers: { "Content-Type": "application/json" },
      }
    );

    const data = await response.json();
    const translatedText = data.data.translations[0].translatedText;

    // Cache translation in i18n
    i18n.addResource(targetLang, "translation", key, translatedText);

    return translatedText;
  } catch (error) {
    console.error("Translation failed:", error);
    return text;
  }
}

export default i18n;
