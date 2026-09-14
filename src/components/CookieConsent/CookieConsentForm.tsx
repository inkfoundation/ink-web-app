"use client";

import { useState } from "react";
import { motion } from "framer-motion";

import Consent, { ConsentType } from "@/integrations/consent";

import { ConsentAcceptAll } from "./ConsentAcceptAll";
import { COOKIE_BANNER_COPY } from "./cookie-banner-copy";

interface CookieConsentProps {
  // If undefined there was no consent decision taken
  initialConsent?: boolean;
  onAccept: VoidFunction;
  onRefuse: VoidFunction;
}

export const CookieConsentForm: React.FC<CookieConsentProps> = (props) => {
  const { initialConsent, onAccept, onRefuse } = props;

  const [decisionMade, setDecisionMade] = useState<boolean | undefined>(
    undefined
  );

  function decision(accepted: boolean) {
    setDecisionMade(accepted);
    if (accepted) {
      Consent.fire(ConsentType.CONSENT);
      onAccept();
    } else {
      onRefuse();
    }
  }

  const currentConsent =
    initialConsent !== undefined ? initialConsent : decisionMade;

  // A decision was taken.
  if (currentConsent !== undefined) {
    // The decision was to accept.
    if (currentConsent) {
      return <ConsentAcceptAll />;
    }

    return null;
  }

  const buttonClasses =
    "flex min-h-10 flex-1 items-center justify-center px-2 py-2 text-center text-[13px] hover:text-blackMagic/60 dark:hover:text-whiteMagic/80";

  return (
    <motion.div
      className="fixed right-0 bottom-0 z-50 m-4 flex max-w-[350px] flex-col overflow-hidden rounded-xl border border-[color:var(--border-subtle,#e7e7e7)] bg-white text-blackMagic dark:bg-blackMagic dark:text-whiteMagic lg:bottom-1"
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: 1 }}
    >
      <p className="px-4 py-3 text-xs">
        {COOKIE_BANNER_COPY.body}
      </p>

      <div className="flex border-t border-[color:var(--border-subtle,#e7e7e7)]">
        <button
          type="button"
          className={buttonClasses}
          onClick={() => {
            window.OneTrust?.ToggleInfoDisplay();
          }}
        >
          <span className="font-semibold">{COOKIE_BANNER_COPY.manage}</span>
        </button>
        <span
          aria-hidden
          className="w-px self-stretch bg-[var(--border-subtle,#e7e7e7)]"
        />
        <button
          type="button"
          className={buttonClasses}
          onClick={() => decision(true)}
        >
          <span className="font-semibold">{COOKIE_BANNER_COPY.accept}</span>
        </button>
      </div>
    </motion.div>
  );
};
