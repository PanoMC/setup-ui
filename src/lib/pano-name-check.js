/**
 * Live check of the Pano Mail sender name while the admin types: debounced, stale answers are
 * ignored, and nothing is asked for an empty name or the name the field was prefilled with.
 */

export const NAME_CHECK_DELAY = 400;

const STATUSES = ["AVAILABLE", "CURRENT", "TAKEN", "INVALID", "UNKNOWN"];

/** @typedef {{ name: string, pending: boolean, status: string | null, reason: string | null, minLength: number | null, maxLength: number | null }} NameCheckState */

/** @returns {NameCheckState} */
export function idleState(name = "") {
  return {
    name,
    pending: false,
    status: null,
    reason: null,
    minLength: null,
    maxLength: null,
  };
}

/** A failed or unreadable answer is UNKNOWN. */
export function parseNameCheck(body) {
  const number = (value) =>
    Number.isFinite(Number(value)) && Number(value) > 0 ? Number(value) : null;
  const status =
    body && typeof body === "object" && STATUSES.includes(body.status)
      ? body.status
      : "UNKNOWN";

  return {
    status,
    reason: body?.reason ? String(body.reason) : null,
    minLength: number(body?.minLength),
    maxLength: number(body?.maxLength),
  };
}

/** The reason says the name has the wrong length. */
export function isLengthReason(reason) {
  return String(reason ?? "").toUpperCase() === "LENGTH";
}

/** Taken / invalid names and a pending check hold Next back; UNKNOWN never does. */
export function nameCheckBlocks(state) {
  return (
    !!state &&
    (state.pending || state.status === "TAKEN" || state.status === "INVALID")
  );
}

/** Bootstrap validation class: "is-valid", "is-invalid" or "". */
export function nameCheckClass(state) {
  if (!state || state.pending) return "";
  if (state.status === "AVAILABLE" || state.status === "CURRENT")
    return "is-valid";
  if (state.status === "TAKEN" || state.status === "INVALID")
    return "is-invalid";

  return "";
}

/** The line under the row: an `errors.*` key with its values, or null (no text for valid). */
export function nameCheckMessage(state) {
  if (!state || state.pending) return null;

  if (state.status === "TAKEN") return { key: "PANO_MAIL_NAME_TAKEN" };

  if (state.status === "INVALID") {
    return lengthOrInvalid(state.reason, state.minLength, state.maxLength);
  }

  return null;
}

/** Shared with the save error. */
export function lengthOrInvalid(reason, minLength, maxLength) {
  return isLengthReason(reason) && minLength && maxLength
    ? {
        key: "PANO_MAIL_NAME_LENGTH",
        props: { min: minLength, max: maxLength },
      }
    : { key: "PANO_MAIL_NAME_INVALID" };
}

/**
 * @param {{ check: (name: string) => Promise<any>, onChange: (state: NameCheckState) => void,
 *   initialName?: string, delay?: number, timers?: { setTimeout: Function, clearTimeout: Function } }} options
 */
export function createNameChecker({
  check,
  onChange,
  initialName = "",
  delay = NAME_CHECK_DELAY,
  timers = globalThis,
}) {
  let timer = null;
  let sequence = 0;

  return {
    /** Call with the name as typed. */
    input(raw) {
      const name = String(raw ?? "")
        .toLowerCase()
        .trim();
      const mine = ++sequence;

      timers.clearTimeout(timer);

      if (name === "" || name === initialName) {
        onChange(idleState(name));
        return;
      }

      onChange({ ...idleState(name), pending: true });

      timer = timers.setTimeout(async () => {
        let body = null;

        try {
          body = await check(name);
        } catch {
          body = null;
        }

        if (mine !== sequence) return;

        onChange({ ...idleState(name), ...parseNameCheck(body) });
      }, delay);
    },

    destroy() {
      sequence++;
      timers.clearTimeout(timer);
    },
  };
}
