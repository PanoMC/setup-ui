/**
 * Big uploads with live numbers: bytes sent of the total, percent, speed (moving average of the
 * last few seconds), time left, and a way to cancel. `ApiUtil` only reports a fraction and cannot
 * abort, so the request is built here with the same URL rules and CSRF header. A copy of
 * panel-ui's `upload.util.js` + `upload-meter.util.js` (the repositories share no code).
 */
import { get } from "svelte/store";

import ApiUtil, { resolveApiUrl } from "$lib/api.util.js";
import { API_URL, CSRF_HEADER } from "$lib/variables.js";
import { page } from "@panomc/sdk/core/js/appStores.js";

/** The speed is the average over this window. */
export const UPLOAD_SPEED_WINDOW_MS = 5_000;

/** Before this much time has passed the time left is "calculating". */
export const UPLOAD_ETA_WARMUP_MS = 2_000;

/** Error code of an upload that was cancelled. */
export const UPLOAD_CANCELLED = "UPLOAD_CANCELLED";

/** Error code of a request that never got an answer. */
export const NETWORK_ERROR = "NETWORK_ERROR";

/**
 * @typedef {object} UploadStats
 * @property {number} loaded bytes sent so far
 * @property {number} total bytes to send
 * @property {number} percent 0..100, whole numbers
 * @property {number | null} speed bytes per second, null while it cannot be told yet
 * @property {number | null} secondsLeft null while calculating
 * @property {boolean} sent every byte went out; the server is still working on the answer
 */

/**
 * @param {number} bytes
 * @returns {string} `B`, `KB`, `MB`, `GB` with one decimal (`5.8 MB`).
 */
export function formatUploadBytes(bytes) {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = Math.max(0, Number(bytes) || 0);
  let unit = 0;

  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit++;
  }

  return unit === 0
    ? `${Math.round(size)} B`
    : `${parseFloat(size.toFixed(1))} ${units[unit]}`;
}

/**
 * Turns progress events into {@link UploadStats}.
 *
 * @param {number} total the file size: what is shown. The browser's total also counts the
 *   multipart framing, so its numbers are scaled to it.
 * @param {number} [startedAt]
 */
export function createUploadMeter(total, startedAt = Date.now()) {
  /** @type {Array<{ at: number, bytes: number }>} */
  const samples = [{ at: startedAt, bytes: 0 }];
  const fileSize = Math.max(0, Number(total) || 0);
  let size = fileSize;

  return {
    /**
     * @param {number} loaded
     * @param {number | null} [eventTotal]
     * @param {number} [now]
     * @returns {UploadStats}
     */
    update(loaded, eventTotal = null, now = Date.now()) {
      let bytes = Math.max(0, Number(loaded) || 0);

      if (eventTotal != null && eventTotal > 0) {
        if (fileSize > 0) {
          bytes = Math.round(
            (Math.min(bytes, eventTotal) / eventTotal) * fileSize,
          );
        } else {
          size = eventTotal;
        }
      }

      bytes = size > 0 ? Math.min(bytes, size) : bytes;

      samples.push({ at: now, bytes });

      while (
        samples.length > 2 &&
        samples[1].at <= now - UPLOAD_SPEED_WINDOW_MS
      ) {
        samples.shift();
      }

      const first = samples[0];
      const seconds = (now - first.at) / 1000;
      const moved = bytes - first.bytes;
      const speed = seconds > 0 && moved > 0 ? moved / seconds : null;
      const warm = now - startedAt >= UPLOAD_ETA_WARMUP_MS;
      const sent = size > 0 && bytes >= size;

      return {
        loaded: bytes,
        total: size,
        percent: size > 0 ? Math.min(100, Math.floor((bytes / size) * 100)) : 0,
        speed: warm ? speed : null,
        secondsLeft: sent
          ? 0
          : warm && speed
            ? Math.ceil((size - bytes) / speed)
            : null,
        sent,
      };
    },
  };
}

async function csrfToken() {
  const session = get(page)?.data?.session;

  if (session?.csrfToken) return session.csrfToken;

  const body = await ApiUtil.get({ path: "/auth/csrf" }).catch(() => null);

  return typeof body?.csrfToken === "string" && body.csrfToken
    ? body.csrfToken
    : null;
}

/**
 * Sends a multipart body and reports its progress. The promise never rejects: it resolves with
 * the parsed body, `{ error: { code: "UPLOAD_CANCELLED" } }` after `abort`, or
 * `{ error: { code: "NETWORK_ERROR" } }` when the connection broke.
 *
 * @param {{
 *   path: string,
 *   body: FormData,
 *   method?: "POST" | "PUT",
 *   size?: number,
 *   onprogress?: (stats: UploadStats) => void,
 * }} options
 * @returns {{ promise: Promise<any>, abort: () => void }}
 */
export function sendUpload({
  path,
  body,
  method = "POST",
  size = 0,
  onprogress = () => {},
}) {
  /** @type {XMLHttpRequest | null} */
  let xhr = null;
  let cancelled = false;

  const promise = (async () => {
    const token = await csrfToken();

    if (cancelled) return { error: { code: UPLOAD_CANCELLED } };

    const url = resolveApiUrl(path, {
      apiUrl: API_URL,
      browser: true,
      prod: !!import.meta.env.PROD,
    });
    const meter = createUploadMeter(size);

    onprogress(meter.update(0));

    return new Promise((resolve) => {
      const request = new XMLHttpRequest();

      xhr = request;
      request.open(method, url);
      request.withCredentials = true;
      request.setRequestHeader("Accept", "application/json");

      if (token) request.setRequestHeader(CSRF_HEADER, token);

      request.upload.onprogress = (event) => {
        onprogress(
          meter.update(
            event.loaded,
            event.lengthComputable ? event.total : null,
          ),
        );
      };

      request.upload.onload = () => {
        onprogress(meter.update(Number.MAX_SAFE_INTEGER));
      };

      request.onload = () => {
        try {
          resolve(JSON.parse(request.responseText));
        } catch {
          resolve(
            request.status >= 400
              ? { error: { code: `HTTP_${request.status}` } }
              : {},
          );
        }
      };

      request.onerror = () => resolve({ error: { code: NETWORK_ERROR } });
      request.ontimeout = () => resolve({ error: { code: NETWORK_ERROR } });
      request.onabort = () => resolve({ error: { code: UPLOAD_CANCELLED } });

      request.send(body);
    });
  })();

  return {
    promise,
    abort() {
      cancelled = true;
      xhr?.abort();
    },
  };
}
