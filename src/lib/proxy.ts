// Headers we forward to the upstream Kraken Verify API. Anything else from
// the incoming request (host, cookie, x-forwarded-*, etc.) would leak
// browser-only state to upstream and is intentionally dropped.
const FORWARDED_REQUEST_HEADERS = new Set([
  "accept",
  "accept-language",
  "authorization",
  "content-type",
  "user-agent",
]);

// Headers we propagate back from upstream to the browser. We do not pass
// through set-cookie, transfer-encoding, content-encoding, etc., because they
// are tied to the upstream connection and can break or be misinterpreted by
// the browser.
const FORWARDED_RESPONSE_HEADERS = new Set([
  "cache-control",
  "content-language",
  "content-type",
]);

export function forwardRequestHeaders(headers: Headers): Headers {
  const out = new Headers();
  headers.forEach((value, key) => {
    if (FORWARDED_REQUEST_HEADERS.has(key.toLowerCase())) {
      out.set(key, value);
    }
  });
  return out;
}

export function forwardResponseHeaders(headers: Headers): Headers {
  const out = new Headers();
  headers.forEach((value, key) => {
    if (FORWARDED_RESPONSE_HEADERS.has(key.toLowerCase())) {
      out.set(key, value);
    }
  });
  return out;
}
