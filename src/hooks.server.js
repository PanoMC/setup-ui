import {
  COOKIE_PREFIX,
  CSRF_TOKEN_COOKIE_NAME,
} from "$lib/variables.js";
import { getAcceptedLanguage } from "$lib/language.util.js";

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({
  event,
  event: {
    cookies,
    request: { headers },
  },
  resolve,
}) {
  event.locals.acceptedLanguage = getAcceptedLanguage(headers);

  event.locals.CSRFToken = cookies.get(COOKIE_PREFIX + CSRF_TOKEN_COOKIE_NAME);

  return resolve(event);
}
