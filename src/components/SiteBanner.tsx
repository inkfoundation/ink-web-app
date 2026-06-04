"use client";

import { useEffect, useState } from "react";
import { InkIcon } from "@inkonchain/ink-kit";

import { EXTERNAL_LINKS, type HrefProp, Link } from "@/routing";

interface BannerConfig {
  /** Flip to false to hide the banner entirely. */
  enabled: boolean;
  /**
   * localStorage key used to remember dismissal. Bump the suffix (e.g. _v2)
   * whenever the message changes so previously-dismissed users see it again.
   */
  storageKey: string;
  /** Text shown before the link. */
  message: string;
  /** Optional inline link rendered right after the message. */
  link?: {
    label: string;
    href: HrefProp;
  };
  /** Text shown after the link (e.g. trailing punctuation). */
  trailing?: string;
}

// To show a banner, set `enabled: true` and update the copy/link below.
const BANNER: BannerConfig = {
  enabled: false,
  storageKey: "ink_site_banner_dismissed_v1",
  message:
    "The Ink network is currently experiencing issues. Transactions may fail. Stay up to date with the latest ",
  link: {
    label: "here",
    href: EXTERNAL_LINKS.twitter,
  },
  trailing: ".",
};

export const SiteBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!BANNER.enabled) {
      return;
    }
    try {
      setVisible(localStorage.getItem(BANNER.storageKey) !== "true");
    } catch {
      setVisible(true);
    }
  }, []);

  if (!BANNER.enabled || !visible) {
    return null;
  }

  const dismiss = () => {
    try {
      localStorage.setItem(BANNER.storageKey, "true");
    } catch {
      // Ignore storage failures (e.g. private mode); just hide for this session.
    }
    setVisible(false);
  };

  return (
    <div
      role="alert"
      className="relative flex w-full items-center justify-center gap-3 px-4 py-3 text-sm font-medium text-blackMagic"
      style={{ backgroundColor: "var(--status-alert, #E7954A)" }}
    >
      <p className="text-center">
        {BANNER.message}
        {BANNER.link && (
          <Link
            href={BANNER.link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:opacity-80"
          >
            {BANNER.link.label}
          </Link>
        )}
        {BANNER.trailing}
      </p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss banner"
        className="ml-2 shrink-0 hover:cursor-pointer hover:opacity-70 lg:absolute lg:right-4 lg:top-1/2 lg:ml-0 lg:-translate-y-1/2"
      >
        <InkIcon.Close className="size-5" />
      </button>
    </div>
  );
};
