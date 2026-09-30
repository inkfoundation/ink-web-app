"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { EXTERNAL_LINKS, Link } from "@/routing";

import { fetchInkNfts, nftSorts, type InkNft, type NftSort } from "./ink-nfts";
import { RankSort } from "./RankSort";

const NFT_SORT_LABEL = {
  volume: "nftSortVolume",
  hour: "nftSortHour",
  floor: "nftSortFloor",
  sales: "nftSortSales",
} as const;

const OPENSEA_HREF =
  /^https:\/\/opensea\.io\/collection\/[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$/;

function formatUsd(value: number | null) {
  if (value === null || !Number.isFinite(value)) return "-";
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 10_000) return `$${(value / 1_000).toFixed(1)}k`;
  if (value >= 1) {
    return `$${value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  })}`;
}

function formatChange(value: number) {
  const abs = Math.abs(value).toFixed(1);
  if (value > 0) return `+${abs}%`;
  if (value < 0) return `-${abs}%`;
  return `${abs}%`;
}

const PLACEHOLDER_TONES = 8;

function placeholderTone(name: string) {
  let hash = 0;
  for (const character of name) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }
  return hash % PLACEHOLDER_TONES;
}

function NftIcon({ nft }: { nft: InkNft }) {
  const [broken, setBroken] = useState(false);
  const showImage = Boolean(nft.imageUrl) && !broken;

  return (
    <span className={`token__icon token__icon--${placeholderTone(nft.name)}`}>
      <span className="token__mark" aria-hidden="true">
        {nft.name.slice(0, 1)}
      </span>
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={nft.imageUrl ?? ""}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setBroken(true)}
        />
      ) : null}
    </span>
  );
}

function NftRow({ nft }: { nft: InkNft }) {
  const t = useTranslations("Home");
  const tone = nft.change24h > 0 ? "up" : nft.change24h < 0 ? "down" : "flat";

  return (
    <a
      className="token"
      href={nft.href}
      target="_blank"
      rel="noreferrer"
      aria-label={`${nft.name}. ${t("nftsFloor")} ${formatUsd(nft.floorUsd)}. ${t("changeWindow")} ${formatChange(nft.change24h)}. ${t("opensInNewTab")}`}
    >
      <NftIcon nft={nft} />
      <span className="token__id">
        <span className="token__symbol">{nft.name}</span>
        <span className="token__name">{t("nftsFloor")}</span>
      </span>
      <span className="token__quote">
        <span className="token__price">{formatUsd(nft.floorUsd)}</span>
        <span className="token__change">
          <span className="token__window">{t("changeWindow")}</span>
          <span className={`token__delta token__delta--${tone}`}>
            {formatChange(nft.change24h)}
          </span>
        </span>
      </span>
    </a>
  );
}

export function NftsColumn() {
  const t = useTranslations("Home");
  const [sort, setSort] = useState<NftSort>("volume");
  const { data, isError, isPending } = useQuery({
    queryKey: ["ink-nfts", sort],
    queryFn: () => fetchInkNfts(sort),
    staleTime: 60_000,
  });
  const nfts = (data ?? []).filter((nft) => OPENSEA_HREF.test(nft.href));

  return (
    <section
      className="col col--nfts"
      id="nfts"
      data-name="nfts"
      role="tabpanel"
      aria-labelledby="feed-tab-nfts"
    >
      <div className="tokens__inner">
        <div className="col__top">
          <span className="pill pill--glass">{t("nftsLabel")}</span>
          <h2 className="headline headline--sm headline--narrow">
            {t("nftsHeadline")}
          </h2>
        </div>
        <div className="token-list">
          <div className="token-list__heading">
            <RankSort
              value={sort}
              options={nftSorts.map((item) => ({
                value: item,
                label: t(NFT_SORT_LABEL[item]),
              }))}
              onChange={setSort}
            />
            <Link
              className="token-list__source"
              href={EXTERNAL_LINKS.openseaInk}
              target="_blank"
              rel="noreferrer"
              aria-label={`${t(NFT_SORT_LABEL[sort])}. ${t("nftsSource")}. ${t("opensInNewTab")}`}
            >
              {t("nftsSource")}
            </Link>
          </div>
          {isPending
            ? Array.from({ length: 24 }, (_, index) => (
                <div className="token token--skeleton" key={index} />
              ))
            : null}
          {isError ? (
            <p className="token-list__status">{t("nftsError")}</p>
          ) : null}
          {!isPending && !isError && nfts.length === 0 ? (
            <p className="token-list__status">{t("nftsEmpty")}</p>
          ) : null}
          {!isPending && !isError
            ? nfts.map((nft) => <NftRow key={nft.slug} nft={nft} />)
            : null}
        </div>
        <Link
          className="pill pill--gray tokens__view-all"
          href={EXTERNAL_LINKS.openseaInk}
          target="_blank"
          rel="noreferrer"
        >
          {t("nftsCta")}
        </Link>
      </div>
    </section>
  );
}
