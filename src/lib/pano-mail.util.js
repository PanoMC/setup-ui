import ApiUtil from "$lib/api.util.js";
import { isOk } from "$lib/api.result.js";

/**
 * Pano Mail: the e-mail service of the website this Pano connects to. All calls live here so the
 * shapes are easy to adjust.
 *
 * `GET /setup/pano-mail` -> `{ website, connected, account: { username } | null,
 * freePlan: { mailsPerMonth, mailsPerDay } | null }`
 * Saving the step with `{ provider: "PANO_MAIL" }` answers ok or `CONNECT_REQUIRED` /
 * `PANO_MAIL_UNAVAILABLE`.
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
    };
  }

  const month = Number(body.freePlan?.mailsPerMonth);
  const username = body.account?.username ? String(body.account.username) : "";

  return {
    website: body.website ? String(body.website) : null,
    connected: body.connected === true && username !== "",
    username,
    mailsPerMonth: Number.isFinite(month) && month > 0 ? month : null,
  };
}

/** Never throws: a Pano without the route renders as "not connected", no number. */
export async function fetchPanoMail() {
  try {
    return parsePanoMail(await ApiUtil.get({ path: "/setup/pano-mail" }));
  } catch {
    return parsePanoMail(null);
  }
}

/** The existing step 3 verify call with the Pano Mail provider; resolves to the error code or null. */
export async function verifyPanoMail() {
  const body = await ApiUtil.post({
    path: "/setup/steps/3/verify",
    body: { provider: PANO_MAIL_PROVIDER },
  }).catch(() => null);

  if (!body) return "NETWORK_ERROR";

  return isOk(body) ? null : body.error?.code || "PANO_MAIL_UNAVAILABLE";
}
