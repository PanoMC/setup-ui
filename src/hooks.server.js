import {
  API_URL,
  COOKIE_PREFIX,
  CSRF_TOKEN_COOKIE_NAME
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

/** @type {import('@sveltejs/kit').HandleServerError} */
export function handleError({ error, event }) {
  console.log("!!! [GLOBAL ERROR EVENT]:", event.url.href);
  console.error("!!! [GLOBAL ERROR CONTENT]:", error);
  return {
    message: 'Internal Error',
    code: error?.code
  };
}

/** @type {import('@sveltejs/kit').HandleFetch} */
export async function handleFetch({ event, request, fetch }) {
  if (request.url.startsWith(API_URL)) {
    request.headers.set('cookie', event.request.headers.get('cookie'));
    request.headers.set("Origin", API_URL);
  }

  return fetch(request);
}