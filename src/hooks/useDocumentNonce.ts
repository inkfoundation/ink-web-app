import { useState } from "react";

/**
 * The nonce of the Content Security Policy the current document was served
 * with, for client components that add scripts after the initial render.
 *
 * A nonce handed down by a server component is only valid for the request
 * that produced the document. Once a server action or `router.refresh()`
 * re-renders the layout, it carries the nonce of that later request, and the
 * browser rejects it. Scripts that were part of the initial HTML keep the
 * right one, so it is read from the first of them.
 */
export function useDocumentNonce(serverNonce?: string) {
  const [nonce] = useState(() => readDocumentNonce() ?? serverNonce);
  return nonce;
}

function readDocumentNonce() {
  if (typeof document === "undefined") return undefined;

  const script = document.querySelector<HTMLScriptElement>("script[nonce]");
  // Browsers blank the attribute once the policy applies and only keep the
  // value on the property; older ones leave it on the attribute.
  return script?.nonce || script?.getAttribute("nonce") || undefined;
}
