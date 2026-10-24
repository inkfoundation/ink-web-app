/**
 * Lightweight sanitizers for the ecosystem app catalog (`apps-data.json`).
 *
 * The catalog is static, PR-reviewed JSON that React renders as text (never
 * via `dangerouslySetInnerHTML`), so this is defence in depth rather than the
 * XSS boundary. It replaces `isomorphic-dompurify`, which pulled `jsdom` into
 * every page's server bundle and whose newer releases need `require(esm)`
 * support that Vercel's Node 22 runtime does not reliably provide (see #397).
 *
 * `sanitizeText` mirrors DOMPurify's behaviour for this data: plain text is
 * returned unchanged, markup is stripped. `sanitizeUrl` is stricter than
 * DOMPurify ever was for these fields, which it treated as opaque text.
 */

const HTML_COMMENTS = /<!--[\s\S]*?-->/g;
// `<` followed by a letter, `/` or `!`, i.e. something that parses as a tag,
// rather than a stray `<` in prose such as "a < b".
const HTML_TAGS = /<\/?[a-zA-Z!][^>]*>/g;
// C0 controls (except tab/newline), DEL.
const CONTROL_CHARS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g;

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

/** Strips HTML tags, comments and control characters from a text field. */
export function sanitizeText(value: string): string {
  return value
    .replace(HTML_COMMENTS, "")
    .replace(HTML_TAGS, "")
    .replace(CONTROL_CHARS, "");
}

/**
 * Keeps absolute `http(s)` URLs (and site-relative paths when `allowRelative`
 * is set); anything else, including `javascript:` and `data:`, becomes "".
 * The original string is returned rather than a normalised one so link text
 * is not altered.
 */
export function sanitizeUrl(
  value: string,
  { allowRelative = false }: { allowRelative?: boolean } = {}
): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (allowRelative && trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed;
  }
  try {
    return ALLOWED_PROTOCOLS.has(new URL(trimmed).protocol) ? trimmed : "";
  } catch {
    return "";
  }
}
