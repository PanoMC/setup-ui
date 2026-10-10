import ApiUtil from "$lib/api.util.js";

/**
 * Pano Backup: the daily backup of the connected website account.
 *
 * `GET /setup/pano-backup` -> `{ website, connected, account: { username } | null, freeGb,
 * plan: { name, quotaBytes, free } | null, usage: { usedBytes } | null, daily, manageUrl }`
 * The final `POST /setup/finish` takes `dailyBackup: true | false`.
 */

const positive = (value) =>
  Number.isFinite(Number(value)) && Number(value) > 0 ? Number(value) : null;

/**
 * @param {any} body response of `GET /setup/pano-backup`, or anything else
 */
export function parsePanoBackup(body) {
  if (!body || typeof body !== "object" || body.error) {
    return {
      available: false,
      website: null,
      freeGb: null,
      plan: null,
      daily: true,
      manageUrl: null,
    };
  }

  const plan = body.plan;

  return {
    available: true,
    website: body.website ? String(body.website) : null,
    freeGb: positive(body.freeGb),
    plan:
      plan && typeof plan === "object" && plan.name
        ? { name: String(plan.name), free: plan.free === true }
        : null,
    // On by default; only an explicit "off" from the account turns it off.
    daily: body.daily !== false,
    manageUrl: body.manageUrl ? String(body.manageUrl) : null,
  };
}

/** Never throws: a Pano without the route gives no switch. */
export async function fetchPanoBackup() {
  try {
    return parsePanoBackup(await ApiUtil.get({ path: "/setup/pano-backup" }));
  } catch {
    return parsePanoBackup(null);
  }
}

/** The switch text: an `steps.account.backup.*` key and its values. */
export function backupSwitchLabel(backup) {
  if (backup.plan && !backup.plan.free) {
    return { key: "daily-plan", values: { plan: backup.plan.name } };
  }

  return backup.freeGb
    ? { key: "daily-free", values: { gb: backup.freeGb } }
    : { key: "daily-free-nogb", values: {} };
}

/** The switch exists for a connected account when Pano answered the route. */
export function showBackupSwitch(backup, connected) {
  return !!connected && !!backup?.available;
}

/** The body of the final save; `dailyBackup` only when the switch was shown. */
export function finishBody(base, backup, connected, daily) {
  return showBackupSwitch(backup, connected)
    ? { ...base, dailyBackup: !!daily }
    : base;
}

/**
 * The lines shown while no account is connected. A missing number gives the line without it.
 *
 * @returns {{ icon: string, key: string, values: Record<string, any> }[]}
 */
export function connectBenefits({ mailsPerMonth, freeGb }, format = String) {
  return [
    mailsPerMonth
      ? {
          icon: "fa-envelope",
          key: "benefit-mail",
          values: { count: format(mailsPerMonth) },
        }
      : { icon: "fa-envelope", key: "benefit-mail-short", values: {} },
    freeGb
      ? {
          icon: "fa-cloud-arrow-up",
          key: "benefit-backup",
          values: { gb: format(freeGb) },
        }
      : { icon: "fa-cloud-arrow-up", key: "benefit-backup-short", values: {} },
    { icon: "fa-puzzle-piece", key: "benefit-store", values: {} },
    { icon: "fa-arrows-rotate", key: "benefit-updates", values: {} },
  ];
}
