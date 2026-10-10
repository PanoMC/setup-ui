import { expect, mock, test } from "bun:test";

mock.module("$lib/api.util.js", () => ({ default: {} }));
mock.module("$lib/api.result.js", () => ({ isOk: () => true }));

const {
  cardPlan,
  manageLink,
  normalizeName,
  panoMailBody,
  panoMailError,
  parsePanoMail,
  senderComplete,
} = await import("./pano-mail.util.js");
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
    mailsPerDay: 50,
    sender: null,
    plan: null,
    manageUrl: null,
  });
});

test("the sender is read with the default local part", () => {
  const parsed = parsePanoMail({
    connected: true,
    account: { username: "a" },
    sender: { name: "craft", zone: "mail.panomc.site", localPart: "" },
  });
  expect(parsed.sender).toEqual({
    name: "craft",
    zone: "mail.panomc.site",
    localPart: "no-reply",
  });
});

test("only the month known gives the month only", () => {
  const parsed = parsePanoMail({ freePlan: { mailsPerMonth: 500 } });
  expect(parsed.mailsPerMonth).toBe(500);
  expect(parsed.mailsPerDay).toBeNull();
});

test("the save body carries provider, name and local part", () => {
  expect(
    panoMailBody({ name: " PanoCraft ", zone: "z", localPart: "no-reply" }),
  ).toEqual({
    provider: "PANO_MAIL",
    name: "panocraft",
    localPart: "no-reply",
  });
  expect(panoMailBody(null)).toEqual({ provider: "PANO_MAIL" });
});

test("next waits for both fields", () => {
  expect(senderComplete(null)).toBe(true);
  expect(senderComplete({ name: "", localPart: "a" })).toBe(false);
  expect(senderComplete({ name: "a", localPart: " " })).toBe(false);
  expect(senderComplete({ name: "a", localPart: "b" })).toBe(true);
  expect(normalizeName("AbC")).toBe("abc");
});

test("failures become alert errors", () => {
  expect(panoMailError({ code: "INVALID_DATA" }, "w")).toEqual({
    key: "PANO_MAIL_LOCAL_INVALID",
  });
  expect(
    panoMailError(
      { code: "PANO_MAIL_NAME_RATE_LIMITED", details: { minutes: 7 } },
      "w",
    ).props.minutes,
  ).toBe(7);
  expect(panoMailError({ code: "NETWORK_ERROR" }, "w")).toBe("NETWORK_ERROR");
  expect(
    panoMailError(
      {
        code: "PANO_MAIL_NAME_INVALID",
        details: { reason: "LENGTH", minLength: 3, maxLength: 32 },
      },
      "w",
    ),
  ).toEqual({ key: "PANO_MAIL_NAME_LENGTH", props: { min: 3, max: 32 } });
  expect(
    panoMailError({ code: "PANO_MAIL_NAME_INVALID", details: {} }, "w").key,
  ).toBe("PANO_MAIL_NAME_INVALID");
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

test("the card shows the account's own plan when connected", () => {
  const parsed = parsePanoMail({
    connected: true,
    account: { username: "a" },
    freePlan: { mailsPerMonth: 500, mailsPerDay: 50 },
    plan: {
      id: "p",
      name: "Plus",
      free: false,
      mailsPerMonth: 5000,
      mailsPerDay: 300,
    },
    manageUrl: "https://panomc.com/profile/mail",
  });
  expect(cardPlan(parsed)).toEqual({
    badge: { name: "Plus" },
    mailsPerMonth: 5000,
    mailsPerDay: 300,
  });
  expect(
    cardPlan({ ...parsed, plan: { ...parsed.plan, free: true } }).badge,
  ).toEqual({ free: true });
  expect(cardPlan({ ...parsed, connected: false })).toEqual({
    badge: { free: true },
    mailsPerMonth: 500,
    mailsPerDay: 50,
  });
  expect(cardPlan({ ...parsed, plan: null }).mailsPerMonth).toBe(500);
});

test("the plan link returns to this page", () => {
  expect(
    manageLink(
      "https://panomc.com/profile/mail",
      "http://localhost:3002/step-3",
    ),
  ).toBe(
    "https://panomc.com/profile/mail?return=http%3A%2F%2Flocalhost%3A3002%2Fstep-3",
  );
  expect(manageLink("https://x.test/a?b=1", "http://h/p")).toBe(
    "https://x.test/a?b=1&return=http%3A%2F%2Fh%2Fp",
  );
});
