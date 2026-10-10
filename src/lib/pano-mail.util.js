import ApiUtil from "$lib/api.util.js";
import { isOk } from "$lib/api.result.js";

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
    };
  }

  const month = Number(body.freePlan?.mailsPerMonth);
  const day = Number(body.freePlan?.mailsPerDay);
  const sender = body.sender;
  const username = body.account?.username ? String(body.account.username) : "";

  return {
    website: body.website ? String(body.website) : null,
    connected: body.connected === true && username !== "",
    username,
    mailsPerMonth: Number.isFinite(month) && month > 0 ? month : null,
    mailsPerDay: Number.isFinite(day) && day > 0 ? day : null,
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
  const { code, minutes } =
    typeof failure === "string" ? { code: failure } : failure;

  if (code === "INVALID_DATA") {
    return { key: "PANO_MAIL_LOCAL_INVALID" };
  }

  if (
    [
      "CONNECT_REQUIRED",
      "PANO_MAIL_UNAVAILABLE",
      "PANO_MAIL_NAME_TAKEN",
      "PANO_MAIL_NAME_INVALID",
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

  const minutes = body.error?.details?.minutes ?? body.error?.minutes;

  return { code: body.error?.code || "PANO_MAIL_UNAVAILABLE", minutes };
}
