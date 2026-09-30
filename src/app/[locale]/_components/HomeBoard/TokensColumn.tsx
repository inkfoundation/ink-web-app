"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { EXTERNAL_LINKS, Link } from "@/routing";

import { fetchInkTokens, type InkToken } from "./ink-tokens";

const GECKO_TERMINAL_HREF =
  /^https:\/\/www\.geckoterminal\.com\/ink\/pools\/0x[a-f0-9]{40,64}$/;

function formatUsd(value: number) {
  if (!Number.isFinite(value)) return "-";
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 10_000) return `$${(value / 1_000).toFixed(1)}k`;
  if (value >= 1) {
    return `$${value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  if (value >= 0.01) {
    return `$${value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    })}`;
  }
  return `$${Number(value.toPrecision(3))}`;
}

function formatChange(value: number) {
  const abs = Math.abs(value).toFixed(1);
  if (value > 0) return `+${abs}%`;
  if (value < 0) return `-${abs}%`;
  return `${abs}%`;
}

const PLACEHOLDER_TONES = 8;

function placeholderTone(symbol: string) {
  let hash = 0;
  for (const character of symbol) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }
  return hash % PLACEHOLDER_TONES;
}

function TokenIcon({ token }: { token: InkToken }) {
  const [broken, setBroken] = useState(false);
  const showImage = Boolean(token.imageUrl) && !broken;

  return (
    <span
      className={`token__icon token__icon--${placeholderTone(token.symbol)}`}
    >
      <span className="token__mark" aria-hidden="true">
        {token.symbol.slice(0, 1)}
      </span>
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={token.imageUrl ?? ""}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setBroken(true)}
        />
      ) : null}
    </span>
  );
}

function TokenRow({ token }: { token: InkToken }) {
  const t = useTranslations("Home");
  const tone =
    token.change24h > 0 ? "up" : token.change24h < 0 ? "down" : "flat";

  return (
    <a
      className="token"
      href={token.href}
      target="_blank"
      rel="noreferrer"
      aria-label={`${token.symbol}. ${t("opensInNewTab")}`}
    >
      <TokenIcon token={token} />
      <span className="token__id">
        <span className="token__symbol">{token.symbol}</span>
        <span className="token__name">{token.name}</span>
      </span>
      <span className="token__quote">
        <span className="token__price">{formatUsd(token.priceUsd)}</span>
        <span className={`token__change token__change--${tone}`}>
          {formatChange(token.change24h)}
        </span>
      </span>
    </a>
  );
}

export function TokensColumn() {
  const t = useTranslations("Home");
  const { data, isError, isPending } = useQuery({
    queryKey: ["ink-tokens"],
    queryFn: fetchInkTokens,
    staleTime: 60_000,
  });
  const tokens = (data ?? []).filter((token) =>
    GECKO_TERMINAL_HREF.test(token.href)
  );

  return (
    <section
      className="col col--tokens"
      id="tokens"
      data-name="tokens"
      role="tabpanel"
      aria-labelledby="feed-tab-tokens"
    >
      <div className="tokens__inner">
        <div className="col__top">
          <span className="pill pill--glass">{t("tokensLabel")}</span>
          <h2 className="headline headline--sm headline--narrow">
            {t("tokensHeadline")}
          </h2>
        </div>
        <div className="token-list">
          {isPending
            ? Array.from({ length: 12 }, (_, index) => (
                <div className="token token--skeleton" key={index} />
              ))
            : null}
          {isError ? (
            <p className="token-list__status">{t("tokensError")}</p>
          ) : null}
          {!isPending && !isError && tokens.length === 0 ? (
            <p className="token-list__status">{t("tokensEmpty")}</p>
          ) : null}
          {!isPending && !isError
            ? tokens.map((token) => (
                <TokenRow key={token.pairAddress} token={token} />
              ))
            : null}
        </div>
        <Link
          className="pill pill--gray tokens__view-all"
          href={EXTERNAL_LINKS.geckoTerminalInk}
          target="_blank"
          rel="noreferrer"
        >
          {t("tokensCta")}
        </Link>
      </div>
    </section>
  );
}
