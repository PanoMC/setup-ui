/**
 * True for a successful API body. Success bodies carry no `result` key any more (doc 04 section 3):
 * a failure is `{ error: { code } }`. A body that is not an object (an HTML error page from a proxy,
 * an empty reply) is not a success either.
 *
 * @param {unknown} body
 * @returns {boolean}
 */
export function isOk(body) {
  return !!body && typeof body === "object" && !body.error;
}
