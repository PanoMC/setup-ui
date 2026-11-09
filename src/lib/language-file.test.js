import { describe, expect, test } from "bun:test";
import path from "path";

import { resolveLanguageFile } from "./language-file.js";

const root = path.resolve(import.meta.dir, "../..");

describe("resolveLanguageFile", () => {
  test("finds bundled locales", () => {
    expect(resolveLanguageFile("en-US", [root])).toBe(
      path.resolve(root, "lang", "en-US.json"),
    );
    expect(resolveLanguageFile("tr", [root])).toBe(
      path.resolve(root, "lang", "tr.json"),
    );
  });

  test("refuses paths", () => {
    for (const bad of [
      "../package",
      "../../x",
      "..\\package",
      "/etc/passwd",
      "en-US/../../package",
      "",
      null,
      "C:\\Windows\\win",
    ]) {
      expect(resolveLanguageFile(bad, [root])).toBeNull();
    }
  });

  test("unknown locale is null", () => {
    expect(resolveLanguageFile("xx-YY", [root])).toBeNull();
  });
});
