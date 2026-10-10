import { expect, mock, test } from "bun:test";

mock.module("$lib/api.util.js", () => ({ default: {} }));

const {
  backupSwitchLabel,
  connectBenefits,
  finishBody,
  parsePanoBackup,
  showBackupSwitch,
} = await import("./pano-backup.util.js");

test("a full answer is parsed", () => {
  expect(
    parsePanoBackup({
      website: "panomc.com",
      account: { username: "a" },
      freeGb: 1,
      plan: { name: "Plus", quotaBytes: 5, free: false },
      daily: false,
      manageUrl: "https://panomc.com/profile/backup",
    }),
  ).toEqual({
    available: true,
    website: "panomc.com",
    freeGb: 1,
    plan: { name: "Plus", free: false },
    daily: false,
    manageUrl: "https://panomc.com/profile/backup",
  });
});

test("a missing route or garbage is unavailable, switch on by default", () => {
  for (const body of [null, "x", { error: { code: "NOT_FOUND" } }]) {
    const parsed = parsePanoBackup(body);
    expect(parsed.available).toBe(false);
    expect(parsed.daily).toBe(true);
    expect(showBackupSwitch(parsed, true)).toBe(false);
  }
  expect(parsePanoBackup({}).daily).toBe(true);
});

test("the switch text names a paid plan, else the free backup", () => {
  expect(
    backupSwitchLabel({ plan: { name: "Plus", free: false }, freeGb: 1 }),
  ).toEqual({ key: "daily-plan", values: { plan: "Plus" } });
  expect(
    backupSwitchLabel({ plan: { name: "Free", free: true }, freeGb: 1 }),
  ).toEqual({ key: "daily-free", values: { gb: 1 } });
  expect(backupSwitchLabel({ plan: null, freeGb: null }).key).toBe(
    "daily-free-nogb",
  );
});

test("dailyBackup is sent only with the switch", () => {
  const base = { a: 1 };
  const backup = { available: true };
  expect(finishBody(base, backup, true, false)).toEqual({
    a: 1,
    dailyBackup: false,
  });
  expect(finishBody(base, backup, false, true)).toEqual(base);
  expect(finishBody(base, { available: false }, true, true)).toEqual(base);
});

test("benefit lines drop a missing number", () => {
  const keys = (b) => b.map((l) => l.key);
  expect(keys(connectBenefits({ mailsPerMonth: 500, freeGb: 1 }))).toEqual([
    "benefit-mail",
    "benefit-backup",
    "benefit-store",
    "benefit-updates",
  ]);
  expect(keys(connectBenefits({ mailsPerMonth: null, freeGb: null }))).toEqual([
    "benefit-mail-short",
    "benefit-backup-short",
    "benefit-store",
    "benefit-updates",
  ]);
});
