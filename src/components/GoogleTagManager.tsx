"use client";

import { GoogleTagManager as NextGoogleTagManager } from "@next/third-parties/google";

import { useDocumentNonce } from "@/hooks/useDocumentNonce";

interface GoogleTagManagerProps {
  gtmId: string;
  nonce?: string;
}

/**
 * GTM mounts when the cookie banner is accepted, after the server action that
 * stores the consent has re-rendered the layout with a new nonce. Its inline
 * bootstrap script needs the nonce of the document it is inserted into.
 */
export const GoogleTagManager: React.FC<GoogleTagManagerProps> = ({
  gtmId,
  nonce,
}) => {
  const documentNonce = useDocumentNonce(nonce);

  return <NextGoogleTagManager gtmId={gtmId} nonce={documentNonce} />;
};
