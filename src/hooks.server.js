import {
  API_URL,
  COOKIE_PREFIX,
  CSRF_TOKEN_COOKIE_NAME
} from "$lib/variables.js";
import { getAcceptedLanguage } from "$lib/language.util.js";

const isDev = process.env.NODE_ENV === "development";
// Cache buster to prevent stale browser cache.
// Each process start generates a new value, forcing fresh file downloads.
const v = isDev ? '' : `?v=${Date.now()}`;
const LIB_IMPORT = `<script src="/lib/bootstrap/bootstrap.bundle.min.js${v}"></script>`;
const PLACEHOLDER = "%pano_lib_import%";
const PLACEHOLDER_LEN = PLACEHOLDER.length;

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

  return resolve(event, {
    transformPageChunk: ({ html }) => {
      const index = html.indexOf(PLACEHOLDER);
      if (index === -1) return html;
      return html.substring(0, index) + LIB_IMPORT + html.substring(index + PLACEHOLDER_LEN);
    },
  });
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