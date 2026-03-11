"use client";

import Image from "next/image";

import { Link } from "@/routing";
import { EXTERNAL_LINKS } from "@/routing";
import { classNames } from "@/util/classes";

import { CookieSettingsButton } from "../CookieSettingsButton";
import { SocialLinksRow } from "../SocialLinksRow";
import { TextUnderline } from "../TextUnderline";

export const Footer = () => {
  return (
    <footer className="w-full">
      <div className="flex justify-between w-full items-start gap-4 flex-col sm:flex-row">
        <div className="flex-1 flex items-start">
          <div>
            <SocialLinksRow />
          </div>
        </div>
        <div className="flex-1 flex gap-4 ink:text-text-muted ink:text-caption-2-regular">
          {/** Need a pt-1 here to align the "Terms of Service" text with the images (since the images are _exactly_ at 0px from the top, contrary to standard text) */}
          <div className="flex flex-col gap-4 opacity-50 pt-1">
            <Link
              className="shrink-0"
              href={EXTERNAL_LINKS.superchain}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/Built_on_Superchain@2x.svg"
                width={167}
                height={30}
                alt="Superchain"
                className={classNames("h-[30px] w-auto dark:invert")}
              />
            </Link>

            <Link
              className="shrink-0"
              href={EXTERNAL_LINKS.ethereum}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/Secured_by_Ethereum@2x.svg"
                width={167}
                height={30}
                alt="Ethereum"
                className={classNames("h-[30px] w-auto dark:invert")}
              />
            </Link>

            <Link
              className="shrink-0"
              href={EXTERNAL_LINKS.kraken}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/Unleashed_by_Kraken@2x.svg"
                width={167}
                height={30}
                alt="Kraken"
                className={classNames("h-[30px] w-auto dark:invert")}
              />
            </Link>
          </div>
          <div className="flex flex-col gap-4 items-start text-left">
            <Link className="group relative" href="/terms">
              Terms of Service
              <TextUnderline halfOpacity />
            </Link>

            <CookieSettingsButton />
          </div>
          <div className="flex flex-col gap-4">© 2024-2025 Payward, Inc.</div>
        </div>
      </div>
    </footer>
  );
};
