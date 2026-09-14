"use client";

import { useState } from "react";
import { motion } from "framer-motion";

import Consent, { ConsentType } from "@/integrations/consent";

import { ConsentAcceptAll } from "./ConsentAcceptAll";

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
    "flex min-h-10 flex-1 items-center justify-center py-2 text-sm hover:text-blackMagic/60 dark:hover:text-whiteMagic/80";

  return (
    <motion.div
      className="fixed right-0 bottom-0 z-50 m-4 flex max-w-[350px] flex-col overflow-hidden rounded-xl border border-blackMagic/25 bg-white text-blackMagic dark:border-whiteMagic/25 dark:bg-blackMagic dark:text-whiteMagic lg:bottom-1"
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: 1 }}
    >
      <div className="flex gap divide-x divide-blackMagic/25 dark:divide-whiteMagic/25">
        <button
          type="button"
          className={buttonClasses}
          onClick={() => decision(false)} // As this is a server action, we have to make sure to not pass the event object
        >
          <span className="font-semibold">Decline</span>
        </button>

        <button
          type="button"
          className={buttonClasses}
          onClick={() => decision(true)}
        >
          <span className="font-semibold">Accept</span>
        </button>
      </div>

      <p className="px-4 py-3 text-xs border-t border-blackMagic/25 dark:border-whiteMagic/25">
        By choosing to Accept, you consent to the use of cookies and similar
        technologies to enhance site navigation, analyse site usage, and assist
        in our marketing and security efforts.
      </p>
    </motion.div>
  );
};
