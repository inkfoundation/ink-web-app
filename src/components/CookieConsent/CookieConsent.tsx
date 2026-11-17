import { cookies } from "next/headers";

import { onAcceptCookiePolicy, onRefuseCookiePolicy } from "@/actions/consent";
import { clientEnv } from "@/env-client";
import { COOKIE_CONSENT } from "@/integrations/consent";

import { ConsentAcceptAll } from "./ConsentAcceptAll";
import { CookieConsentForm } from "./CookieConsentForm";
import { OneTrustCookieConsent } from "./OneTrustCookiesConsent";

const IS_OPEN_TRUST_ENABLE_FOR_ENV = !["local", "development", "ci"].includes(
  clientEnv.NEXT_PUBLIC_ENVIRONMENT
);

export const CookieConsent = async ({ nonce }: { nonce?: string }) => {
  const isEuropeanCountry = true;
  const cookieStore = await cookies();
  const cookieConsent = cookieStore.get(COOKIE_CONSENT)?.value;

  const initialConsent =
    cookieConsent === "true"
      ? true
      : cookieConsent === "false"
        ? false
        : undefined;

  return (
    <>
      {clientEnv.NEXT_PUBLIC_ONE_TRUST_ID && IS_OPEN_TRUST_ENABLE_FOR_ENV ? (
        <OneTrustCookieConsent
          id={clientEnv.NEXT_PUBLIC_ONE_TRUST_ID}
          nonce={nonce}
        />
      ) : isEuropeanCountry ? (
        <CookieConsentForm
          initialConsent={initialConsent}
          onAccept={onAcceptCookiePolicy}
          onRefuse={onRefuseCookiePolicy}
        />
      ) : (
        <ConsentAcceptAll />
      )}
    </>
  );
};
