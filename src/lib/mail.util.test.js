import { describe, expect, test } from "bun:test";

import { detectMailService } from "./mail.util.js";

const services = {
  GMAIL: { config: { hostname: "smtp.gmail.com" } },
  YANDEX: { config: { hostname: "smtp.yandex.com" } },
  OTHER: { config: {} },
};

const saved = {
  sender: "noreply@example.com",
  hostname: "smtp.gmail.com",
  username: "noreply@example.com",
  port: 587,
  password: "",
};

describe("detectMailService", () => {
  test("pre-selects by hostname even though the API returns no password", () => {
    expect(detectMailService(saved, services)).toBe("GMAIL");
  });

  test("matches the hostname case-insensitively", () => {
    expect(
      detectMailService({ ...saved, hostname: " SMTP.Yandex.com " }, services),
    ).toBe("YANDEX");
  });

  test("falls back to OTHER for an unknown host", () => {
    expect(
      detectMailService({ ...saved, hostname: "mail.example.com" }, services),
    ).toBe("OTHER");
  });

  test("selects nothing when no mail settings were saved", () => {
    expect(detectMailService(null, services)).toBeNull();
    expect(
      detectMailService({ ...saved, hostname: "", sender: "" }, services),
    ).toBeNull();
  });
});
