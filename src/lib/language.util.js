import { browser } from "$app/environment";
import { get, writable } from "svelte/store";

import {
  register,
  getLocaleFromNavigator,
  init as initI18n,
  locale,
  waitLocale,
} from "svelte-i18n";

export const Languages = Object.freeze({
  EN_US: {
    locale: "en-US",
    file: () => import("$lib/lang/en-US.json"),
    name: "English (US)",
  },
  TR: {
    locale: "tr",
    file: () => import("$lib/lang/tr.json"),
    derivatives: ["tr-tr"],
    name: "Türkçe (TR)",
  },
});

export const loadedLanguages = writable([]);
export const languageLoading = writable(false);
export const currentLanguage = writable(null);

export async function init(initialLocale) {
  if (browser) {
    initialLocale = get(locale);

    if (get(locale) === null) {
      initialLocale = getLocaleFromNavigator();
    }
  }

  const language = getLanguageByLocale(get(locale));
  const languageToLoad = get(currentLanguage) || (language === null ? Languages.EN_US : language);

  await loadLanguage(languageToLoad);
  currentLanguage.set(languageToLoad);

  initI18n({
    fallbackLocale: "en-US",
    initialLocale,
  });
}

export function getAcceptedLanguage(headers) {
  const header = headers.get("accept-language")

  if (typeof header === "undefined" || !header) {
    return "";
  }

  const split = header.split(",")

  if (split.length === 0) {
    return "";
  }

  return split[0];
}

export async function loadLanguage(language) {
  if (get(loadedLanguages).indexOf(language) !== -1) {
    return;
  }

  loadedLanguages.update((list) => {
    list.push(language);

    return list;
  });

  register(language.locale, language.file);
  await waitLocale(language.locale);

  if (language.derivatives) {
    for (const derivative of language.derivatives) {
      register(derivative, language.file);

      await waitLocale(language.locale);
    }
  }
}

export async function changeLanguage(language) {
  if (get(currentLanguage) === language) {
    return;
  }

  languageLoading.set(true);

  if (get(loadedLanguages).indexOf(language) === -1) {
    await loadLanguage(language);
  }

  locale.set(language.locale);
  currentLanguage.set(language);

  languageLoading.set(false);
}

export function getLanguageByLocale(locale) {
  let foundLanguage = null;

  Object.keys(Languages).forEach((language) => {
    if (language.locale === locale) {
      foundLanguage = language;
    }
  });

  return foundLanguage;
}
