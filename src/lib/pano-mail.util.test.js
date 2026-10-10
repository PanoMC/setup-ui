import { expect, mock, test } from "bun:test";

mock.module("$lib/api.util.js", () => ({ default: {} }));
mock.module("$lib/api.result.js", () => ({ isOk: () => true }));

const { parsePanoMail } = await import("./pano-mail.util.js");
const { connectUrl } = await import("./pano-connect.util.js");

test("a connected account with a free plan", () => {
  expect(
    parsePanoMail({
      website: "panomc.com",
      connected: true,
      account: { username: "ahmet" },
      freePlan: { mailsPerMonth: 500, mailsPerDay: 50 },
    }),
  ).toEqual({
    website: "panomc.com",
    connected: true,
    username: "ahmet",
    mailsPerMonth: 500,
  });
});

test("no plan or no account shows no number and not connected", () => {
  const parsed = parsePanoMail({
    website: "x.test",
    connected: true,
    freePlan: null,
  });
  expect(parsed.connected).toBe(false);
  expect(parsed.mailsPerMonth).toBeNull();
});

test("an error body or garbage renders as not connected", () => {
  for (const body of [null, undefined, "x", { error: { code: "NOT_FOUND" } }]) {
    expect(parsePanoMail(body).connected).toBe(false);
    expect(parsePanoMail(body).mailsPerMonth).toBeNull();
  }
});

test("the connect address encodes every part", () => {
  expect(
    connectUrl({
      websiteUrl: "https://panomc.com",
      publicKey: "a+b",
      state: "s/1",
      redirectUrl: "http://localhost:3002/step-3",
      locale: "tr",
    }),
  ).toBe(
    "https://panomc.com/auth?loginPanoPlatform=a%2Bb&redirectUrl=http%3A%2F%2Flocalhost%3A3002%2Fstep-3&state=s%2F1&hl=tr",
  );
});
