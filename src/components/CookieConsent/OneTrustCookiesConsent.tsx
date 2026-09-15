"use client";
import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Script from "next/script";

import { onAcceptCookiePolicy, onRefuseCookiePolicy } from "@/actions/consent";
import Consent, { ConsentType } from "@/integrations/consent";

import "./onetrust-banner.css";

interface OneTrustCookieConsentProps {
  id: string;
}

export const OneTrustCookieConsent: React.FC<OneTrustCookieConsentProps> = ({
  id,
}) => {
  const query = useSearchParams();

  /** OneTrust Cookies Consent Notice start for inkonchain.com */
  const initCode = `
   window.oneTrustLoaded = new Promise(function (resolve) {
          window.OptanonWrapper = function OptanonWrapper() {
            resolve(window.OneTrust);
          };
        });
  `;

  useEffect(() => {
    if (query.get("consent")) {
      onAcceptCookiePolicy();
      Consent.fire(ConsentType.CONSENT);
    }
  }, [query]);

  useEffect(() => {
    keepBannerOverridesLast();

    window.oneTrustLoaded?.then((oneTrust) => {
      keepBannerOverridesLast();
      oneTrust.OnConsentChanged(() => {
        hasConsent(OneTrustCookieGroups.Performance).then((consented) => {
          if (consented) {
            onAcceptCookiePolicy();
            Consent.fire(ConsentType.CONSENT);
          } else {
            onRefuseCookiePolicy();
          }
        });
      });
    });

    const observer = new MutationObserver(keepBannerOverridesLast);
    observer.observe(document.head, { childList: true });
    const timeout = window.setTimeout(() => observer.disconnect(), 8000);

    return () => {
      observer.disconnect();
      window.clearTimeout(timeout);
    };
  }, []);

  return (
    <>
      <Script
        id="otSDKStub"
        src="https://cdn.cookielaw.org/scripttemplates/otSDKStub.js"
        type="text/javascript"
        charSet="UTF-8"
        data-domain-script={id}
      ></Script>
      <script
        type="text/javascript"
        dangerouslySetInnerHTML={{ __html: initCode }}
      />
    </>
  );
};

enum OneTrustCookieGroups {
  StrictlyNecessary = "C0001",
  Performance = "C0002",
  Functional = "C0003",
  Advertising = "C0004",
  SocialMedia = "C0005",
}

function hasConsent(onetrustCookieGroup: OneTrustCookieGroups) {
  return new Promise((resolve) => {
    return waitUntilConditionIsMet({
      condition: () => Boolean(window.OnetrustActiveGroups),
      retries: 10,
      retriesInterval: 100,
    }).then(() => {
      resolve(window.OnetrustActiveGroups?.includes(onetrustCookieGroup));
    });
  });
}

async function waitUntilConditionIsMet({
  condition,
  retries,
  retriesInterval,
}: {
  condition: () => boolean;
  retries: number;
  retriesInterval: number;
}) {
  let currentRetry = 0;
  while (!condition() && currentRetry < retries) {
    await new Promise((resolve) => setTimeout(resolve, retriesInterval));
    currentRetry++;
  }
  return condition();
}

const BANNER_OVERRIDE_STYLE_ID = "ink-onetrust-banner-overrides";

function isBannerOverrideRule(cssText: string) {
  return (
    cssText.includes("onetrust") ||
    cssText.includes("ot-sdk") ||
    cssText.includes("ink-onetrust-banner-marker")
  );
}

/** Copy only our banner rules into a dedicated tag so OneTrust cannot restyle the app chunk. */
function keepBannerOverridesLast() {
  const existing = document.getElementById(BANNER_OVERRIDE_STYLE_ID);
  if (existing) {
    if (document.head.lastElementChild !== existing) {
      document.head.appendChild(existing);
    }
    return;
  }

  const rules: string[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      const cssRules = Array.from(sheet.cssRules);
      if (
        !cssRules.some((rule) =>
          rule.cssText.includes("ink-onetrust-banner-marker")
        )
      ) {
        continue;
      }
      for (const rule of cssRules) {
        if (isBannerOverrideRule(rule.cssText)) {
          rules.push(rule.cssText);
        }
      }
    } catch {
      continue;
    }
  }

  if (rules.length === 0) return;

  const style = document.createElement("style");
  style.id = BANNER_OVERRIDE_STYLE_ID;
  style.textContent = rules.join("\n");
  document.head.appendChild(style);
}
