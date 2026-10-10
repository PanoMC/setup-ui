import ApiUtil from "$lib/api.util.js";
import { isOk } from "$lib/api.result.js";
import { lengthOrInvalid } from "$lib/pano-name-check.js";

/**
 * Pano Mail: the e-mail service of the website this Pano connects to. All calls live here so the
 * shapes are easy to adjust.
 *
 * `GET /setup/pano-mail` -> `{ website, connected, account: { username } | null,
 * freePlan: { mailsPerMonth, mailsPerDay } | null, sender: { name, zone, localPart } | null }`
 * Saving the step (verify + step PUT) with `{ provider: "PANO_MAIL", name, localPart }` answers ok
 * or `CONNECT_REQUIRED` / `PANO_MAIL_UNAVAILABLE` / `PANO_MAIL_NAME_TAKEN` /
 * `PANO_MAIL_NAME_INVALID` / `PANO_MAIL_NAME_RATE_LIMITED` (`minutes`) / `INVALID_DATA`.
 */

export const PANO_MAIL_PROVIDER = "PANO_MAIL";

/**
 * @param {any} body response of `GET /setup/pano-mail`, or anything else
 * @returns {{ website: string | null, connected: boolean, username: string, mailsPerMonth: number | null }}
 */
export function parsePanoMail(body) {
  if (!body || typeof body !== "object" || body.error) {
    return {
      website: null,
      connected: false,
      username: "",
      mailsPerMonth: null,
      mailsPerDay: null,
      sender: null,
      plan: null,
      manageUrl: null,
    };
  }

  const month = Number(body.freePlan?.mailsPerMonth);
  const day = Number(body.freePlan?.mailsPerDay);
  const sender = body.sender;
  const positive = (value) =>
    Number.isFinite(Number(value)) && Number(value) > 0 ? Number(value) : null;
  const plan = body.plan;
  const username = body.account?.username ? String(body.account.username) : "";

  return {
    website: body.website ? String(body.website) : null,
    connected: body.connected === true && username !== "",
    username,
    mailsPerMonth: Number.isFinite(month) && month > 0 ? month : null,
    mailsPerDay: Number.isFinite(day) && day > 0 ? day : null,
    plan:
      plan && typeof plan === "object" && plan.name
        ? {
            id: plan.id ?? null,
            name: String(plan.name),
            free: plan.free === true,
            mailsPerMonth: positive(plan.mailsPerMonth),
            mailsPerDay: positive(plan.mailsPerDay),
          }
        : null,
    manageUrl: body.manageUrl ? String(body.manageUrl) : null,
    sender:
      sender && typeof sender === "object" && sender.zone
        ? {
            name: String(sender.name ?? ""),
            zone: String(sender.zone),
            localPart: String(sender.localPart || DEFAULT_LOCAL_PART),
          }
        : null,
  };
}

/**
 * What the card shows: the connected account's own plan when the API sends one, the free plan
 * otherwise. `badge` is "free" or the plan's name.
 *
 * @returns {{ badge: { free: true } | { name: string }, mailsPerMonth: number | null, mailsPerDay: number | null }}
 */
export function cardPlan(panoMail) {
  const plan = panoMail.connected ? panoMail.plan : null;

  if (!plan) {
    return {
      badge: { free: true },
      mailsPerMonth: panoMail.mailsPerMonth,
      mailsPerDay: panoMail.mailsPerDay,
    };
  }

  return {
    badge: plan.free ? { free: true } : { name: plan.name },
    mailsPerMonth: plan.mailsPerMonth,
    mailsPerDay: plan.mailsPerDay,
  };
}

/** The website's plan page; it sends the admin back to `pageUrl` (origin + pathname). */
export function manageLink(manageUrl, pageUrl) {
  return `${manageUrl}${manageUrl.includes("?") ? "&" : "?"}return=${encodeURIComponent(pageUrl)}`;
}

export const DEFAULT_LOCAL_PART = "no-reply";

/** The name is typed lowercase only. */
export function normalizeName(value) {
  return String(value ?? "").toLowerCase();
}

/** The body parts that go with the provider; nothing when the API sent no sender. */
export function senderBody(sender) {
  if (!sender) return {};

  return {
    name: normalizeName(sender.name).trim(),
    localPart: String(sender.localPart ?? "").trim(),
  };
}

/** Next stays disabled while either field is empty (a Pano without a sender row needs neither). */
export function senderComplete(sender) {
  if (!sender) return true;

  const { name, localPart } = senderBody(sender);

  return name !== "" && localPart !== "";
}

/** The save body of both calls. */
export function panoMailBody(sender) {
  return { provider: PANO_MAIL_PROVIDER, ...senderBody(sender) };
}

/**
 * Turns a failed save into the `ErrorAlert` error.
 *
 * @param {{ code: string, minutes?: number } | string} failure
 * @param {string} website
 */
export function panoMailError(failure, website) {
  const { code, details } =
    typeof failure === "string" ? { code: failure } : failure;
  const minutes = details?.minutes;

  if (code === "INVALID_DATA") {
    return { key: "PANO_MAIL_LOCAL_INVALID" };
  }

  if (code === "PANO_MAIL_NAME_INVALID") {
    return {
      ...lengthOrInvalid(
        details?.reason,
        Number(details?.minLength),
        Number(details?.maxLength),
      ),
    };
  }

  if (
    [
      "CONNECT_REQUIRED",
      "PANO_MAIL_UNAVAILABLE",
      "PANO_MAIL_NAME_TAKEN",
      "PANO_MAIL_NAME_RATE_LIMITED",
    ].includes(code)
  ) {
    return { key: code, props: { website, minutes: minutes ?? "" } };
  }

  return code;
}

/** Never throws: a Pano without the route renders as "not connected", no number. */
export async function fetchPanoMail() {
  try {
    return parsePanoMail(await ApiUtil.get({ path: "/setup/pano-mail" }));
  } catch {
    return parsePanoMail(null);
  }
}

/** The existing step 3 verify call with the Pano Mail provider; resolves to the failure (`{ code, minutes }`) or null. */
export async function verifyPanoMail(sender) {
  const body = await ApiUtil.post({
    path: "/setup/steps/3/verify",
    body: panoMailBody(sender),
  }).catch(() => null);

  if (!body) return { code: "NETWORK_ERROR" };

  if (isOk(body)) return null;

  return {
    code: body.error?.code || "PANO_MAIL_UNAVAILABLE",
    details: body.error?.details,
  };
}

/** `POST /setup/pano-mail/name-check` -> the parsed answer; a missing route or error is UNKNOWN. */
export async function checkPanoMailName(name) {
  try {
    return await ApiUtil.post({
      path: "/setup/pano-mail/name-check",
      body: { name },
    });
  } catch {
    return null;
  }
}
