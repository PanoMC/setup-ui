import ApiUtil from "$lib/api.util.js";

/**
 * The website's sign-in address for connecting this Pano: the website sends the owner back to
 * `redirectUrl` with `encodedData` + `state` (or `failed`).
 *
 * @param {{ websiteUrl: string, publicKey: string, state: string, redirectUrl: string, locale: string }} options
 * @returns {string}
 */
export function connectUrl({
  websiteUrl,
  publicKey,
  state,
  redirectUrl,
  locale,
}) {
  return `${websiteUrl}/auth?loginPanoPlatform=${encodeURIComponent(publicKey)}&redirectUrl=${encodeURIComponent(redirectUrl)}&state=${encodeURIComponent(state)}&hl=${locale}`;
}

/**
 * Asks Pano for a key and goes to the website's sign-in.
 *
 * @returns {Promise<object | null>} the failed response (`{}` on a network error); null when the page navigates away
 */
export async function startPanoConnect({ websiteUrl, locale, beforeRedirect }) {
  const body = await ApiUtil.post({
    path: "/setup/steps/4/platform/code",
  }).catch(() => null);

  if (!body || body.error) return body ?? {};

  beforeRedirect?.();

  window.location.href = connectUrl({
    websiteUrl,
    publicKey: body.publicKey,
    state: body.state,
    redirectUrl: window.location.origin + window.location.pathname,
    locale,
  });

  return null;
}

/**
 * Finishes a connect the website returned from.
 *
 * @param {string} search `window.location.search`
 * @returns {Promise<{ code: string } | null>} null when connected (or nothing to finish)
 */
export async function finishPanoConnect(search) {
  const params = new URLSearchParams(search);
  const encodedData = params.get("encodedData");
  const state = params.get("state");

  if (encodedData && state) {
    const body = await ApiUtil.post({
      path: "/setup/steps/4/platform/connect",
      body: { encodedData, state },
    }).catch(() => null);

    if (
      !body ||
      (body.error && body.error.code !== "ALREADY_CONNECTED_TO_PANO")
    ) {
      return { code: body?.error?.code || "FAILED" };
    }

    return null;
  }

  return params.has("failed") ? { code: "FAILED" } : null;
}
