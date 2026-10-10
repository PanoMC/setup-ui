/** Languages the documentation is translated into; every other one reads the English pages. */
const TRANSLATED = ["tr", "ru"];

/**
 * The documentation address in the selected language: English lives at `/docs`, a translation at
 * `/docs/<language>`.
 *
 * @param {string} base the website the documentation is on, without a trailing slash
 * @param {string | null | undefined} locale the selected locale (`tr`, `en-US`, `ru`)
 * @param {string} [path] a page below the documentation root, starting with `/`
 * @returns {string}
 */
export function docsUrl(base, locale, path = "") {
  const language = String(locale || "")
    .toLowerCase()
    .split("-")[0];
  const prefix = TRANSLATED.includes(language) ? `/${language}` : "";

  return `${base}/docs${prefix}${path}`;
}
