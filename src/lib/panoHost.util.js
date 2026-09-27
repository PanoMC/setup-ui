/**
 * setup-ui "import from Pano Backup": the transfer dialog connects the panomc.com account with the
 * same endpoints as setup step 4 (`/api/setup/steps/4/platform/code` + `/connect`), from step 0. The
 * website sends the browser back to `redirectUrl` with `?encodedData=…&state=…` (or `?failed=true`),
 * replacing any query of its own, so the dialog reopens when the first page sees those.
 */

/**
 * @param {URLSearchParams} searchParams
 * @returns {{ encodedData: string | null, state: string | null, failed: boolean } | null}
 */
export function connectReturn(searchParams) {
  const encodedData = searchParams.get("encodedData");
  const state = searchParams.get("state");
  const failed = searchParams.get("failed") === "true";

  if (failed) return { encodedData: null, state: null, failed: true };
  if (encodedData && state) return { encodedData, state, failed: false };

  return null;
}

/**
 * panomc.com sign-in URL that authorizes this Pano (same shape as setup step 4).
 *
 * @param {{ websiteUrl: string, publicKey: string, state: string, redirectUrl: string, locale: string }} input
 */
export function connectUrl({
  websiteUrl,
  publicKey,
  state,
  redirectUrl,
  locale,
}) {
  return (
    `${websiteUrl}/auth?loginPanoPlatform=${encodeURIComponent(publicKey)}` +
    `&redirectUrl=${encodeURIComponent(redirectUrl)}` +
    `&state=${encodeURIComponent(state)}` +
    `&hl=${encodeURIComponent(locale)}`
  );
}

/**
 * What a failed `GET /api/setup/pano-host/backups` asks for: `"connect"` (no account connected),
 * `"reconnect"` (the connection was revoked on panomc.com) or `null` (any other error).
 *
 * @param {{ error?: string, hostError?: string } | null | undefined} body
 * @returns {"connect" | "reconnect" | null}
 */
export function connectNeeded(body) {
  if (!body || body.error !== "PANO_HOST_ERROR") return null;
  if (body.hostError === "CONNECT_REQUIRED") return "connect";
  if (body.hostError === "INVALID_TOKEN") return "reconnect";

  return null;
}

/**
 * `POST /api/setup/steps/4/platform/connect` answered: connected (also when it already was).
 *
 * @param {{ result?: string, error?: string } | null | undefined} body
 */
export function connectSucceeded(body) {
  return (
    !!body &&
    (body.result === "ok" || body.error === "ALREADY_CONNECTED_TO_PANO")
  );
}
