import { expect, test } from "bun:test";

import { docsUrl } from "./docs.util.js";

test("a translated language gets its own documentation", () => {
  expect(docsUrl("https://panomc.com", "tr")).toBe(
    "https://panomc.com/docs/tr",
  );
  expect(docsUrl("https://panomc.com", "ru", "/platform/")).toBe(
    "https://panomc.com/docs/ru/platform/",
  );
});

test("English and unknown languages read the English pages", () => {
  expect(docsUrl("https://panomc.com", "en-US")).toBe(
    "https://panomc.com/docs",
  );
  expect(docsUrl("https://panomc.com", "de")).toBe("https://panomc.com/docs");
  expect(docsUrl("https://panomc.com", null, "/x/")).toBe(
    "https://panomc.com/docs/x/",
  );
});
