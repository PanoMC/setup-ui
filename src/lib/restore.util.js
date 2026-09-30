/**
 * Pure helpers of the setup "Transfer" dialog (restore from a file, import from Pano Backup):
 * archive sniffing, job progress, poll timing and error → lang key mapping. Free of Svelte and
 * `$lib` imports so `bun test` runs them as they are.
 */

/** archive-format.md §3: `"PANOARC\x01" | u32 headerLen (big endian) | header JSON`. */
export const ENVELOPE_MAGIC = Object.freeze([
  0x50, 0x41, 0x4e, 0x4f, 0x41, 0x52, 0x43, 0x01,
]);

const MAX_HEADER_BYTES = 16 * 1024;

/** How many leading bytes {@link inspectArchiveFile} reads: magic + length + the largest header. */
export const ARCHIVE_SNIFF_BYTES = ENVELOPE_MAGIC.length + 4 + MAX_HEADER_BYTES;

/**
 * Errors of the setup restore routes, their jobs and Pano Host (`PANO_HOST_ERROR.hostError`) that
 * have their own sentence under `import.errors.*`; anything else uses `import.errors.generic`.
 */
export const KNOWN_ERRORS = Object.freeze([
  "NETWORK_ERROR",
  "BAD_REQUEST",
  "NOT_EXISTS",
  "FILE_TOO_LARGE",
  "PANO_BACKUP_BUSY",
  "NOT_AN_ARCHIVE",
  "UNSUPPORTED_FORMAT",
  "PASSPHRASE_REQUIRED",
  "WRONG_PASSPHRASE",
  "TAMPERED",
  "TRUNCATED",
  "INVALID_ARCHIVE",
  "UNSAFE_ENTRY",
  "UNSAFE_SQL",
  "TOO_LARGE",
  "WRONG_KIND",
  "ARCHIVE_NEWER_THAN_TARGET",
  "HASH_MISMATCH",
  "RESTORE_FAILED",
  "DATABASE_CONNECTION_FAILED",
  "EXPORT_FAILED",
  "RATE_LIMITED",
  "TASK_IN_PROGRESS",
  "PORTAL_OFFLINE",
  "PORTAL_UNSUPPORTED",
  "WORKLOAD_SUSPENDED",
  "INVALID_WORKLOAD_STATE",
  "WORKLOAD_NOT_FOUND",
  "CONNECT_REQUIRED",
  "PANO_HOST_UNAVAILABLE",
  "PANO_HOST_NOT_LINKED",
  "INVALID_TOKEN",
  "DOWNLOAD_FAILED",
  "INTEGRITY_FAILED",
  "BACKUP_NOT_FOUND",
  "PAYMENT_REQUIRED",
  "LINK_EXPIRED",
]);

/**
 * @param {ArrayLike<number> | null | undefined} bytes the first bytes of a file.
 * @returns {{ type: "encrypted" | "plain" | "unknown", keyMode: string | null }} `encrypted` = a
 *   `.panoarc` envelope (`keyMode` from its header when it fits), `plain` = a zip (export format).
 */
export function inspectArchiveHeader(bytes) {
  const data = bytes ? Array.from(bytes) : [];

  if (
    data.length >= 4 &&
    data[0] === 0x50 &&
    data[1] === 0x4b &&
    data[2] === 3 &&
    data[3] === 4
  ) {
    return { type: "plain", keyMode: null };
  }

  if (
    data.length < ENVELOPE_MAGIC.length ||
    ENVELOPE_MAGIC.some((b, i) => data[i] !== b)
  ) {
    return { type: "unknown", keyMode: null };
  }

  let keyMode = null;
  const offset = ENVELOPE_MAGIC.length;

  if (data.length >= offset + 4) {
    const length =
      ((data[offset] << 24) >>> 0) +
      (data[offset + 1] << 16) +
      (data[offset + 2] << 8) +
      data[offset + 3];

    if (
      length >= 2 &&
      length <= MAX_HEADER_BYTES &&
      data.length >= offset + 4 + length
    ) {
      try {
        const header = JSON.parse(
          new TextDecoder().decode(
            Uint8Array.from(data.slice(offset + 4, offset + 4 + length)),
          ),
        );

        keyMode = typeof header?.keyMode === "string" ? header.keyMode : null;
      } catch {
        keyMode = null;
      }
    }
  }

  return { type: "encrypted", keyMode };
}

/**
 * Reads the start of a picked file in the browser, so the dialog asks for a passphrase only when
 * the file needs one and refuses files it cannot restore before anything is uploaded (a failed
 * setup restore deletes the upload).
 *
 * @param {Blob} file
 */
export async function inspectArchiveFile(file) {
  const buffer = await file.slice(0, ARCHIVE_SNIFF_BYTES).arrayBuffer();

  return inspectArchiveHeader(new Uint8Array(buffer));
}

/**
 * What the dialog does with a sniffed file.
 *
 * @param {{ type: string, keyMode: string | null }} info
 * @returns {"plain" | "passphrase" | "workload" | "unknown"}
 */
export function archiveKind(info) {
  if (info.type === "plain") return "plain";
  if (info.type !== "encrypted") return "unknown";
  if (info.keyMode === "workload") return "workload";

  // A header that did not fit the sniffed bytes is treated as a passphrase archive.
  return "passphrase";
}

/**
 * @param {{ bytesDone?: number, bytesTotal?: number } | null | undefined} job
 * @returns {number | null} 0–100 when the job reports bytes, else null (indeterminate bar).
 */
export function jobPercent(job) {
  const total = Number(job?.bytesTotal) || 0;

  if (total <= 0) return null;

  return Math.max(
    0,
    Math.min(100, Math.floor(((Number(job?.bytesDone) || 0) / total) * 100)),
  );
}

/**
 * The device-code poll interval in ms, never faster than 2 s nor slower than 30 s.
 *
 * @param {number | null | undefined} seconds
 */
export function pollDelay(seconds) {
  const value = Number(seconds);

  return (
    Math.min(30, Math.max(2, Number.isFinite(value) && value > 0 ? value : 5)) *
    1000
  );
}

/**
 * @param {number | null | undefined} bytes
 */
export function formatBytes(bytes) {
  const value = Number(bytes) || 0;
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = value;
  let unit = 0;

  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit++;
  }

  return `${unit === 0 ? size : size.toFixed(size >= 10 ? 0 : 1)} ${units[unit]}`;
}

/**
 * The fields of the restore request for the target database; an empty host means "the one from
 * setup step 2" on the backend, which the first page of the wizard does not have yet.
 *
 * @param {{ host?: string, dbName?: string, username?: string, password?: string }} database
 */
export function databaseProblem(database) {
  if (!(database.host || "").trim()) return "host";
  if (!(database.dbName || "").trim()) return "dbName";
  if (!(database.username || "").trim()) return "username";

  return null;
}

/**
 * Turns a response body (`{error, hostError?}`) or a finished job (`{error}`) into a lang key.
 *
 * @param {object | null | undefined} source
 * @returns {{ code: string, key: string } | null}
 */
export function describeError(source) {
  if (!source || !source.error) return null;

  let code = String(source.error);

  if (code === "PANO_HOST_ERROR") {
    code = String(source.hostError || "PANO_HOST_UNAVAILABLE");
  }

  return {
    code,
    key: KNOWN_ERRORS.includes(code)
      ? `import.errors.${code}`
      : "import.errors.generic",
  };
}

/**
 * The host of the Pano website setup talks to (e.g. `panomc.com`), for `{website}` in the texts.
 *
 * @param {string | null | undefined} url `PANO_WEBSITE_URL`.
 * @returns {string}
 */
export function websiteHost(url) {
  try {
    return new URL(String(url)).hostname || "panomc.com";
  } catch {
    return "panomc.com";
  }
}
