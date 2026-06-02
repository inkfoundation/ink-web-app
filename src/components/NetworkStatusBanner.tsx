"use client";

import { useEffect, useState } from "react";
import { InkIcon } from "@inkonchain/ink-kit";

import { EXTERNAL_LINKS, Link } from "@/routing";

// Bump the suffix to re-show the banner after a new incident/message.
const DISMISS_KEY = "ink_network_status_banner_dismissed_v1";

export const NetworkStatusBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      setVisible(localStorage.getItem(DISMISS_KEY) !== "true");
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) {
    return null;
  }

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, "true");
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
        The Ink network is currently experiencing issues. Transactions may fail.
        Stay up to date with the latest{" "}
        <Link
          href={EXTERNAL_LINKS.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:opacity-80"
        >
          here
        </Link>
        .
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
