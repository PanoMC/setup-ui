import fs from "fs";
import path from "path";

// A locale code such as `en-US`, `tr` or `zh-Hant-TW`: never a path.
const LOCALE_CODE = /^[a-z]{2,3}(-[A-Za-z0-9]{2,8}){0,2}$/;

/**
 * Finds the bundled language file for a locale code, or `null`. Only plain locale codes are
 * accepted, and the file must stay inside a `lang` folder, so a crafted code cannot read other
 * files.
 * @param {unknown} language
 * @param {string[]} [baseDirs] folders that hold `lang/` (the working directory, then the server's own)
 * @returns {string | null}
 */
export function resolveLanguageFile(
  language,
  baseDirs = [process.cwd(), path.dirname(process.argv[1] ?? "")],
) {
  if (typeof language !== "string" || !LOCALE_CODE.test(language)) {
    return null;
  }

  for (const dir of baseDirs) {
    const langDir = path.resolve(dir, "lang");
    const filePath = path.resolve(langDir, `${language}.json`);

    if (!filePath.startsWith(langDir + path.sep)) continue;

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      return filePath;
    }
  }

  return null;
}
