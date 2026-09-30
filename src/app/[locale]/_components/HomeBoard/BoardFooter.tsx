"use client";

import { InkIcon, useModalContext } from "@inkonchain/ink-kit";
import { useTranslations } from "next-intl";

import { CONTACT_US_MODAL_KEY } from "@/components/Modals";
import { EXTERNAL_LINKS, Link } from "@/routing";

const SOCIALS = [
  { href: EXTERNAL_LINKS.twitter, labelKey: "footerX", Icon: InkIcon.Social.X },
  {
    href: EXTERNAL_LINKS.telegram,
    labelKey: "footerTelegram",
    Icon: InkIcon.Social.Telegram,
  },
  {
    href: EXTERNAL_LINKS.github,
    labelKey: "footerGithub",
    Icon: InkIcon.Social.Github,
  },
] as const;

export function BoardFooter() {
  const t = useTranslations("Home");
  const { openModal } = useModalContext(CONTACT_US_MODAL_KEY);
  const year = new Date().getFullYear();

  return (
    <footer className="board-footer">
      <div className="board-footer__legal">
        <Link className="board-footer__link" href="/terms">
          {t("footerTerms")}
        </Link>
        <button
          className="board-footer__link"
          type="button"
          onClick={() => {
            window.OneTrust?.ToggleInfoDisplay();
          }}
        >
          {t("footerCookies")}
        </button>
        <p className="board-footer__copy">
          {t("footerCopyright", { from: 2024, year })}
        </p>
      </div>
      <nav className="board-footer__socials" aria-label={t("footerSocials")}>
        {SOCIALS.map(({ href, labelKey, Icon }) => (
          <Link
            className="board-footer__icon"
            href={href}
            key={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${t(labelKey)}. ${t("opensInNewTab")}`}
          >
            <Icon />
          </Link>
        ))}
        <button
          className="board-footer__icon"
          type="button"
          aria-label={t("footerContact")}
          onClick={openModal}
        >
          <InkIcon.Mail />
        </button>
      </nav>
    </footer>
  );
}
