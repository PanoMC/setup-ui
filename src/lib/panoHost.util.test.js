import { describe, expect, test } from "bun:test";

import {
  connectNeeded,
  connectReturn,
  connectSucceeded,
  connectUrl,
} from "./panoHost.util.js";

describe("connectReturn", () => {
  test("reads a successful sign-in", () => {
    expect(
      connectReturn(new URLSearchParams("encodedData=abc%2B%3D&state=s1")),
    ).toEqual({ encodedData: "abc+=", state: "s1", failed: false });
  });

  test("reads a failed sign-in", () => {
    expect(connectReturn(new URLSearchParams("failed=true"))).toEqual({
      encodedData: null,
      state: null,
      failed: true,
    });
  });

  test("ignores an ordinary visit or half a return", () => {
    expect(connectReturn(new URLSearchParams(""))).toBeNull();
    expect(connectReturn(new URLSearchParams("state=s1"))).toBeNull();
    expect(connectReturn(new URLSearchParams("encodedData=x"))).toBeNull();
    expect(connectReturn(new URLSearchParams("failed=false"))).toBeNull();
  });
});

describe("connectUrl", () => {
  test("encodes every dynamic part", () => {
    const url = connectUrl({
      websiteUrl: "https://panomc.com",
      publicKey: "a+b/c=",
      state: "x&y",
      redirectUrl: "http://localhost:8088/",
      locale: "tr",
    });

    expect(url).toBe(
      "https://panomc.com/auth?loginPanoPlatform=a%2Bb%2Fc%3D" +
        "&redirectUrl=http%3A%2F%2Flocalhost%3A8088%2F&state=x%26y&hl=tr",
    );

    const params = new URL(url).searchParams;

    expect(params.get("loginPanoPlatform")).toBe("a+b/c=");
    expect(params.get("redirectUrl")).toBe("http://localhost:8088/");
    expect(params.get("state")).toBe("x&y");
  });
});

describe("connectNeeded", () => {
  test("not connected asks to connect", () => {
    expect(
      connectNeeded({
        error: "PANO_HOST_ERROR",
        hostError: "CONNECT_REQUIRED",
      }),
    ).toBe("connect");
  });

  test("a revoked connection asks to reconnect", () => {
    expect(
      connectNeeded({ error: "PANO_HOST_ERROR", hostError: "INVALID_TOKEN" }),
    ).toBe("reconnect");
  });

  test("other errors are plain errors", () => {
    expect(
      connectNeeded({
        error: "PANO_HOST_ERROR",
        hostError: "PAYMENT_REQUIRED",
      }),
    ).toBeNull();
    expect(connectNeeded({ error: "NOT_EXISTS" })).toBeNull();
    expect(connectNeeded({ result: "ok" })).toBeNull();
    expect(connectNeeded(null)).toBeNull();
  });
});

describe("connectSucceeded", () => {
  test("ok and already connected both count", () => {
    expect(connectSucceeded({ result: "ok" })).toBe(true);
    expect(connectSucceeded({ error: "ALREADY_CONNECTED_TO_PANO" })).toBe(true);
    expect(connectSucceeded({ error: "PANO_CONNECT_FAILED" })).toBe(false);
    expect(connectSucceeded(null)).toBe(false);
  });
});

describe("translations", () => {
  const languages = ["en-US", "tr", "ru"].map((name) => [
    name,
    JSON.parse(
      require("node:fs").readFileSync(
        new URL(`../../lang/${name}.json`, import.meta.url),
        "utf8",
      ),
    ),
  ]);

  test("every language has the Pano Backup connect strings and restore errors", async () => {
    const { KNOWN_ERRORS } = await import("./restore.util.js");
    const hostKeys = [
      "intro",
      "connect",
      "reconnect",
      "reconnect-button",
      "retry",
      "checking",
      "finishing",
      "connected",
      "connected-as",
      "no-backups",
    ];

    for (const [name, lang] of languages) {
      for (const key of hostKeys) {
        expect([name, key, typeof lang.import.host[key]]).toEqual([
          name,
          key,
          "string",
        ]);
      }
      for (const code of KNOWN_ERRORS) {
        expect([name, code, typeof lang.import.errors[code]]).toEqual([
          name,
          code,
          "string",
        ]);
      }
    }
  });
});
