"use client";
import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { InkIcon } from "@inkonchain/ink-kit";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";

import { OnlyWithFeatureFlag } from "@/components/OnlyWithFeatureFlag";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { useRouterQuery } from "@/hooks/useRouterQuery";
import { EXTERNAL_LINKS, Link, usePathname, useRouter } from "@/routing";

import "./interactive-ascii";
import "./interactive-ink";

import { isAppsPath } from "../../apps/_components/filter-apps";
import {
  type InkApp,
  type InkAppNetwork,
  inkApps,
  inkFeaturedApps,
  mainUrl,
} from "../../apps/_components/InkApp";
import tydroArt from "../Home/assets/tydro-banner-trans.png";

import { AppsEmptyState, AppsOverlayFilters } from "./AppsOverlayFilters";
import {
  builderExpectations,
  builderHeroCtas,
  builderResources,
  builderStartSteps,
  builderStats,
} from "./builder-resources";
import { CodeStory } from "./CodeStory";
import { departureMono, satoshi } from "./home-board-fonts";
import { HomeConnectPill } from "./HomeConnectPill";
import { initBoard } from "./init-board";
import { initGoo } from "./init-goo";
import { initNavGlass } from "./init-nav-glass";
import { moreBridges } from "./more-bridges";
import { useAppsOverlayFilters } from "./use-apps-overlay-filters";

import "./home-board.css";
import "./relay-board.css";

type OverlayMode = "apps" | "bridge" | "builders";

function overlayModeFromPath(pathname: string): OverlayMode {
  if (isAppsPath(pathname)) return "apps";
  if (pathname === "/builders") return "builders";
  return "bridge";
}

function formatTag(tag: string) {
  return tag
    .toLowerCase()
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function isAirdropPill(pill: string) {
  return pill.toLowerCase().replace(/\s+/g, "-") === "airdrop";
}

const APP_SOCIALS = [
  { key: "x", label: "X", Icon: InkIcon.Social.X },
  { key: "discord", label: "Discord", Icon: InkIcon.Social.Discord },
  { key: "telegram", label: "Telegram", Icon: InkIcon.Social.Telegram },
  { key: "farcaster", label: "Farcaster", Icon: InkIcon.Social.Farcaster },
  { key: "github", label: "GitHub", Icon: InkIcon.Social.Github },
] as const;

function getAppSocials(links: InkApp["links"]) {
  return APP_SOCIALS.filter(({ key }) => Boolean(links[key]));
}

function InkMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 30 30"
      fill="none"
      shapeRendering="auto"
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M30 15C30 6.71573 23.2843 -3.62117e-7 15 0 6.71573 3.62117e-7 -3.62117e-7 6.71573 0 15c3.62117e-7 8.2843 6.71573 15 15 15s15-6.7157 15-15ZM17.1409 26.2262c0 1.0176-.8352 1.8448-2.0207 1.8685l-.0986.0005h-.0432C7.756 28.0836 1.90476 22.2251 1.90476 15 1.90476 7.76772 7.7677 1.90479 15 1.90479l.1169.00051c1.3378.02382 2.024.85093 2.024 1.86847 0 1.03561-.9154 1.79766-1.8853 1.79766s-1.0175 0-1.9459.0744c-.9284.07439-1.8884.83645-1.8884 1.869 0 1.03867.8438 1.87512 1.8884 1.87512h8.2336c1.0415 0 1.8853.83645 1.8853 1.86895 0 1.0326-.8438 1.869-1.8853 1.869H8.86143c-1.04464 0-1.88839.8396-1.88839 1.8752 0 1.0325.84375 1.869 1.88839 1.869h6.39417c1.0416 0 1.8853.8364 1.8853 1.872 0 1.0326-.8437 1.869-1.8853 1.869h-1.9459c-1.0446 0-1.8884.8365-1.8884 1.869 0 1.0356.8648 1.7916 1.8884 1.869l.2225.0169c.3602.0275.5571.0425.7542.0507.2373.0099.4751.0099.9993.0099 1.0416 0 1.8552.7651 1.8552 1.7976Z"
      />
    </svg>
  );
}

const TYDRO_APP_ID = "tydro";
const tydroArtSrc = typeof tydroArt === "string" ? tydroArt : tydroArt.src;

const BoardAppCard = memo(function BoardAppCard({
  app,
  network = "Mainnet",
  featured = false,
  hero = false,
}: {
  app: InkApp;
  network?: InkAppNetwork;
  featured?: boolean;
  hero?: boolean;
}) {
  const t = useTranslations("Home");
  const href = mainUrl(app, network) || "/apps";
  const descId = `app-desc-${app.id}`;
  const tags = app.tags.slice(0, 2);
  const socials = getAppSocials(app.links);
  const pills = [
    ...(featured
      ? [{ key: "featured", label: t("appsFeatured"), tone: "featured" }]
      : []),
    ...(app.pills ?? [])
      .filter(isAirdropPill)
      .slice(0, 1)
      .map((pill) => ({
        key: pill,
        label: t("appsPillAirdrop"),
        tone: "airdrop",
      })),
  ];

  return (
    <article className={`app${hero ? " app--hero" : ""}`}>
      <a
        className="app__hit"
        href={href}
        target="_blank"
        rel="noreferrer"
        aria-label={`${app.name}. ${t("opensInNewTab")}`}
        aria-describedby={descId}
      />
      {hero ? (
        <div className="app__media" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={tydroArtSrc} alt="" />
          <video
            autoPlay
            loop
            muted
            playsInline
            controls={false}
            disablePictureInPicture
            preload="metadata"
            poster={tydroArtSrc}
          >
            <source src="/tydro-animation.mp4" type="video/mp4" />
          </video>
        </div>
      ) : null}
      {pills.length > 0 ? (
        <div className="app__pills">
          {pills.map((pill) => (
            <span className={`tag tag--${pill.tone}`} key={pill.key}>
              {pill.tone === "airdrop" ? <InkMark /> : null}
              {pill.tone === "featured" ? (
                <span className="tag__label">{pill.label}</span>
              ) : (
                pill.label
              )}
            </span>
          ))}
        </div>
      ) : null}
      <div className="app__icon">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={app.imageUrl} alt="" width={56} height={56} />
      </div>
      <div className="app__meta">
        <div className="app__copy">
          <p className="app__name">{app.name}</p>
          <div className="app__desc">
            <div className="app__desc-clip">
              <p className="app__desc-text" id={descId}>
                {app.description}
              </p>
            </div>
          </div>
        </div>
        <div
          className={`app__tags${socials.length > 0 ? " app__tags--socials" : ""}`}
        >
          <div className="app__tags-clip">
            <div className="tags">
              {tags.map((tag) => (
                <span className="tag" key={tag}>
                  {formatTag(tag)}
                </span>
              ))}
            </div>
            {socials.length > 0 ? (
              <div className="app__socials" aria-label="Social links">
                {socials.map(({ key, label, Icon }) => (
                  <a
                    className="app__social"
                    href={app.links[key]}
                    key={key}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${label}. ${t("opensInNewTab")}`}
                  >
                    <Icon />
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
});

function DevLinkGoIcon() {
  return (
    <span className="dev-link__go" aria-hidden="true">
      <svg width="24" height="24" viewBox="0 0 16 16" fill="none">
        <path
          d="M5 11 11 5M6.75 5H11v4.25"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function BuilderFeatureIcon({ icon }: { icon: string }) {
  let symbol;

  if (icon.includes("1s-block-times")) {
    symbol = <path d="m13 5-5 8h4l-1 6 5-8h-4l1-6Z" />;
  } else if (icon.includes("Smol-Gas")) {
    symbol = (
      <>
        <path d="M8 18V7.5c0-.8.7-1.5 1.5-1.5h5c.8 0 1.5.7 1.5 1.5V18M7 18h10M10 9h4" />
        <path d="M16 9.5h1l1 1.2V15c0 .6-.4 1-1 1h-1" />
      </>
    );
  } else if (icon.includes("Security")) {
    symbol = (
      <>
        <rect x="7.5" y="10.5" width="9" height="7.5" rx="1.5" />
        <path d="M9.5 10.5V9a2.5 2.5 0 0 1 5 0v1.5M12 13.5v1.8" />
      </>
    );
  } else if (icon.includes("Interoperability")) {
    symbol = (
      <>
        <circle cx="12" cy="7" r="1.5" />
        <circle cx="8" cy="15" r="1.5" />
        <circle cx="16" cy="15" r="1.5" />
        <path d="m10.4 8.2-1.6 4.1M13.6 8.2l1.6 4.1M10 15h4" />
      </>
    );
  } else if (icon.includes("Kraken")) {
    symbol = (
      <path d="M7.5 17v-5a4.5 4.5 0 0 1 9 0v5M10.5 17v-5a1.5 1.5 0 0 1 3 0v5M7.5 15H6v2M16.5 15H18v2" />
    );
  } else {
    symbol = (
      <>
        <path d="m12 5-4.5 7 4.5 2.5 4.5-2.5L12 5Z" />
        <path d="m7.5 13 4.5 6 4.5-6-4.5 2.5L7.5 13Z" />
      </>
    );
  }

  return (
    <svg
      className="dev-focus__icon"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10.5" />
      <g
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {symbol}
      </g>
    </svg>
  );
}

function OverlayClose({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <div className="apps__close-slot">
      <div className="apps__close-clip">
        <button
          className="slider__btn apps__close"
          type="button"
          aria-label={label}
          onClick={onClick}
        >
          <span className="apps__close-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M5 5l10 10M15 5 5 15"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
}

export function HomeBoard() {
  const t = useTranslations("Home");
  const tAbout = useTranslations("About");
  const tBuilders = useTranslations("Builders");
  const query = useRouterQuery();
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const isMainnet = useFeatureFlag("mainnet") === true;
  const rootRef = useRef<HTMLDivElement>(null);
  const pendingInstantBridge = useRef(false);
  const overlayReady = useRef(false);
  const overlayModeRef = useRef<OverlayMode>(overlayModeFromPath(pathname));
  const isApps = isAppsPath(pathname);
  const {
    filters,
    overlayApps,
    hasFilters,
    updateFilters,
    resetFilters,
    resetSearch,
  } = useAppsOverlayFilters();
  const isBridge = pathname === "/bridge";
  const isBuilders = pathname === "/builders";
  const isOverlay = isApps || isBridge || isBuilders;

  useEffect(() => {
    router.prefetch("/");
    router.prefetch("/apps");
    router.prefetch("/bridge");
    router.prefetch("/builders");
  }, [router]);

  if (isOverlay) overlayModeRef.current = overlayModeFromPath(pathname);
  const overlayMode = overlayModeRef.current;
  const resources = useMemo(() => builderResources(isMainnet), [isMainnet]);
  const heroCtas = useMemo(() => builderHeroCtas(isMainnet), [isMainnet]);

  const queryParams = useMemo(
    () => Object.fromEntries(new URLSearchParams(query)),
    [query]
  );

  const goHome = useCallback(() => {
    router.push({ pathname: "/", query: queryParams });
  }, [queryParams, router]);

  const goApps = useCallback(() => {
    router.push({ pathname: "/apps", query: queryParams });
  }, [queryParams, router]);

  const goBridge = useCallback(() => {
    router.push({ pathname: "/bridge", query: queryParams });
  }, [queryParams, router]);

  const goBuilders = useCallback(() => {
    router.push({ pathname: "/builders", query: queryParams });
  }, [queryParams, router]);

  const toggleApps = useCallback(() => {
    if (isApps) {
      goHome();
      return;
    }
    goApps();
  }, [goApps, goHome, isApps]);

  const toggleBridge = useCallback(() => {
    if (isBridge) {
      goHome();
      return;
    }
    goBridge();
  }, [goBridge, goHome, isBridge]);

  const toggleBuilders = useCallback(() => {
    if (isBuilders) {
      goHome();
      return;
    }
    goBuilders();
  }, [goBuilders, goHome, isBuilders]);

  const featuredIds = useMemo(
    () => new Set(inkFeaturedApps.map((app) => app.id)),
    []
  );
  const overlayList = useMemo(() => {
    const hero = overlayApps.find((app) => app.id === TYDRO_APP_ID);
    if (!hero) return overlayApps;
    return [hero, ...overlayApps.filter((app) => app.id !== TYDRO_APP_ID)];
  }, [overlayApps]);
  const apps = useMemo(
    () => [
      ...inkFeaturedApps,
      ...inkApps.filter((app) => !featuredIds.has(app.id)),
    ],
    [featuredIds]
  );
  useLayoutEffect(() => {
    const html = document.documentElement;
    const classTheme = html.classList.contains("dark")
      ? "dark"
      : html.classList.contains("light")
        ? "light"
        : null;
    const dataTheme =
      html.dataset.theme === "dark" || html.dataset.theme === "light"
        ? html.dataset.theme
        : null;
    const initialTheme =
      classTheme ??
      dataTheme ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");

    // Set the correct tokens before enabling the scoped board styles. This
    // prevents light borders from painting for one frame in dark mode.
    html.dataset.theme = initialTheme;
    html.setAttribute("data-home-board", "");
    return () => {
      html.removeAttribute("data-home-board");
      html.removeAttribute("data-theme");
      html.removeAttribute("data-bridge-open");
      html.removeAttribute("data-bridge-instant");
      html.removeAttribute("data-bridge-closing");
      html.removeAttribute("data-overlay");
      html.classList.remove("is-instant", "theme-fallback-transition");
    };
  }, []);

  useLayoutEffect(() => {
    if (resolvedTheme !== "dark" && resolvedTheme !== "light") return;
    document.documentElement.dataset.theme = resolvedTheme;
    window.dispatchEvent(
      new CustomEvent("inkthemechange", { detail: { theme: resolvedTheme } })
    );
  }, [resolvedTheme]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const stopBoard = initBoard(root);
    const stopGlass = initNavGlass(root);
    const stopGoo = initGoo(root);
    return () => {
      stopGoo();
      stopGlass();
      stopBoard();
    };
  }, []);

  useEffect(() => {
    const onCloseBridge = (event: Event) => {
      const animate = (event as CustomEvent<{ animate?: boolean }>).detail
        ?.animate;
      if (animate === false) pendingInstantBridge.current = true;
      goHome();
    };
    window.addEventListener("ink:close-bridge", onCloseBridge);
    return () => {
      window.removeEventListener("ink:close-bridge", onCloseBridge);
    };
  }, [goHome]);

  useLayoutEffect(() => {
    const html = document.documentElement;
    const animate = overlayReady.current;
    const instantClose = pendingInstantBridge.current;
    pendingInstantBridge.current = false;

    if (isOverlay) {
      html.setAttribute("data-overlay", overlayMode);
      if (!animate) {
        html.setAttribute("data-bridge-instant", "");
        html.setAttribute("data-bridge-open", "");
        requestAnimationFrame(() => {
          html.removeAttribute("data-bridge-instant");
        });
      }
      window.dispatchEvent(
        new CustomEvent("ink:set-bridge", {
          detail: { open: true, animate },
        })
      );
      if (!html.hasAttribute("data-bridge-open")) {
        html.setAttribute("data-bridge-open", "");
      }
    } else {
      html.removeAttribute("data-overlay");
      if (!animate) {
        html.removeAttribute("data-bridge-open");
        html.removeAttribute("data-bridge-instant");
        html.removeAttribute("data-bridge-closing");
      }
      window.dispatchEvent(
        new CustomEvent("ink:set-bridge", {
          detail: {
            open: false,
            animate: animate && !instantClose,
          },
        })
      );
    }

    overlayReady.current = true;
  }, [isOverlay, overlayMode]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    type AnimatedSurface = HTMLElement & {
      pause?: () => void;
      play?: () => void;
    };
    const homeInk = root.querySelector<AnimatedSurface>(
      ".col--hero interactive-ink"
    );
    const developerAscii = root.querySelector<AnimatedSurface>(
      ".col--devs-hero interactive-ascii"
    );
    const setPlaying = (surface: AnimatedSurface | null, playing: boolean) => {
      if (playing) surface?.play?.();
      else surface?.pause?.();
    };

    setPlaying(homeInk, !isOverlay);
    setPlaying(developerAscii, isBuilders);
  }, [isBuilders, isOverlay]);

  const toggleTheme = useCallback(() => {
    const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
    const apply = () => setTheme(nextTheme);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      apply();
      return;
    }

    if (document.startViewTransition) {
      document.startViewTransition(apply);
      return;
    }

    const html = document.documentElement;
    html.classList.add("theme-fallback-transition");
    apply();
    window.setTimeout(() => {
      html.classList.remove("theme-fallback-transition");
    }, 460);
  }, [resolvedTheme, setTheme]);

  const isDark = resolvedTheme === "dark";

  // next-themes rewrites <html> classes on theme change, so font vars stay here.
  return (
    <div
      className={`home-board ${satoshi.variable} ${departureMono.variable}`}
      ref={rootRef}
      {...(isOverlay && !overlayReady.current
        ? {
            "data-bridge-open": "",
            "data-bridge-instant": "",
            "data-overlay": overlayMode,
          }
        : {})}
    >
      <div className="page">
        <div className="board">
          <section className="col col--about" data-name="about">
            <div className="col__top">
              <span className="pill pill--glass">{t("aboutLabel")}</span>
              <div className="col__copy">
                <p className="headline">{t("aboutHeadline")}</p>
                <div className="cta-row">
                  <Link
                    className="pill pill--purple"
                    href={{ pathname: "/bridge", query }}
                  >
                    {t("bridgeCta")}
                  </Link>
                  <Link
                    className="pill pill--gray"
                    href={{ pathname: "/builders", query }}
                  >
                    {t("buildCta")}
                  </Link>
                </div>
              </div>
            </div>
            <CodeStory snippetId="deploy-snippet" />
          </section>

          <section className="col col--hero" data-name="hero">
            <interactive-ink
              className="hero-media"
              value="3"
              speed="1"
              interaction="0.7"
              edge="0"
              blur="0"
              phase="28"
            />
            <Link
              className="pill pill--glass pill--refractive glass-bar"
              href={{ pathname: "/builders", query }}
            >
              <canvas className="pill__glass" aria-hidden="true" />
              <span className="pill__label">{t("builtOnInk")}</span>
            </Link>
          </section>

          <section className="col col--started" data-name="started">
            <div className="col__top">
              <span className="pill pill--glass">{t("startedLabel")}</span>
              <p className="headline headline--sm headline--narrow">
                {t("startedHeadline")}
              </p>
            </div>
            <article className="step">
              <span className="step__n">1</span>
              <div className="step__body">
                <p className="step__label">{t("stepBridge")}</p>
                <Link
                  className="pill pill--gray"
                  href={{ pathname: "/bridge", query }}
                >
                  {t("bridgeCta")}
                </Link>
              </div>
            </article>
            <article className="step">
              <span className="step__n">2</span>
              <div className="step__body">
                <p className="step__label">{t("stepTrade")}</p>
                <Link
                  className="pill pill--gray"
                  href={EXTERNAL_LINKS.nado}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("perpsCta")}
                </Link>
              </div>
            </article>
            <article className="step">
              <span className="step__n">3</span>
              <div className="step__body">
                <p className="step__label">{t("stepEarn")}</p>
                <Link
                  className="pill pill--gray"
                  href={EXTERNAL_LINKS.tydro}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("earnCta")}
                </Link>
              </div>
            </article>
          </section>

          <section className="col col--apps" id="apps" data-name="apps">
            <div className="apps__inner">
              <div className="col__top">
                <div className="apps__heading">
                  <button
                    className="pill pill--glass apps__tag"
                    type="button"
                    aria-expanded={isApps}
                    aria-current={isApps ? "page" : undefined}
                    onClick={goApps}
                  >
                    {t("appsLabel")}
                  </button>
                </div>
                <p className="headline headline--sm headline--narrow">
                  {t("appsHeadline")}
                </p>
              </div>
              <div className="app-list">
                {apps.map((app) => (
                  <BoardAppCard app={app} key={app.id} />
                ))}
              </div>
              <button
                className="pill pill--gray apps__view-all"
                type="button"
                onClick={goApps}
              >
                {t("appsCta")}
              </button>
            </div>
          </section>

          <div
            className="bridge-layer"
            data-mode={overlayMode}
            inert={!isOverlay}
          >
            <div className="bridge-layer__inner">
              {/* Relay remount: add .col--relay + RelayKitUI here. See ./relay-board.ts */}
              <section
                className="col col--apps-overlay col--catalog"
                data-name="apps-overlay"
              >
                <div className="catalog__inner">
                  <div className="col__top">
                    <div className="apps__heading">
                      <span className="pill pill--glass">{t("appsLabel")}</span>
                      <OverlayClose label={t("closeApps")} onClick={goHome} />
                    </div>
                    <p className="headline headline--sm headline--narrow">
                      {t("appsHeadline")}
                    </p>
                    <AppsOverlayFilters
                      enabled={isApps}
                      filters={filters}
                      onChange={updateFilters}
                    />
                  </div>
                  <div className="app-list">
                    {overlayApps.length === 0 ? (
                      <AppsEmptyState
                        hasFilters={hasFilters}
                        hasSearch={!!filters.search}
                        onResetFilters={resetFilters}
                        onResetSearch={resetSearch}
                      />
                    ) : (
                      overlayList.map((app) => (
                        <BoardAppCard
                          app={app}
                          featured={featuredIds.has(app.id)}
                          hero={app.id === TYDRO_APP_ID}
                          key={app.id}
                          network={filters.network || "Mainnet"}
                        />
                      ))
                    )}
                  </div>
                </div>
              </section>

              <section
                className="col col--bridges col--catalog"
                data-name="bridges"
              >
                <div className="catalog__inner">
                  <div className="col__top">
                    <div className="apps__heading">
                      <span className="pill pill--glass">
                        {t("bridgesLabel")}
                      </span>
                      <OverlayClose label={t("closeBridge")} onClick={goHome} />
                    </div>
                    <p className="headline headline--sm headline--narrow">
                      {t("bridgesHeadline")}
                    </p>
                  </div>
                  <div className="app-list">
                    {moreBridges.map((bridge) => (
                      <a
                        className="app"
                        href={bridge.url}
                        key={bridge.name}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <div className="app__icon">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={bridge.icon} alt="" />
                        </div>
                        <div className="app__meta">
                          <div className="app__copy">
                            <p className="app__name">{bridge.name}</p>
                            <div className="app__desc">
                              <div className="app__desc-clip">
                                <p className="app__desc-text">
                                  {bridge.description}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="app__tags app__tags--keep">
                            <div className="app__tags-clip">
                              <div className="tags">
                                {bridge.assetIcons.map((icon) => (
                                  <span className="tag" key={icon}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={`/icons/tokens/${icon}.svg`}
                                      alt=""
                                    />
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </section>

              <section className="col col--devs" data-name="developers">
                <div className="devs__inner">
                  <div className="col__top">
                    <div className="apps__heading">
                      <span className="pill pill--glass">
                        {t("developersCta")}
                      </span>
                      <OverlayClose
                        label={t("closeDevelopers")}
                        onClick={goHome}
                      />
                    </div>
                  </div>
                  <div className="devs__block devs__block--hero">
                    <div className="devs__intro">
                      <p className="headline headline--sm">
                        {tBuilders("why.title")}
                      </p>
                      <p className="devs__lede">{tAbout("description")}</p>
                    </div>
                    <div className="cta-row">
                      {heroCtas.map((cta) => {
                        const className = `pill pill--${cta.tone}`;
                        const label = tBuilders(`cta.${cta.key}`);
                        if (cta.external) {
                          return (
                            <Link
                              className={className}
                              href={cta.href}
                              key={cta.key}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={`${label}. ${t("opensInNewTab")}`}
                            >
                              {label}
                            </Link>
                          );
                        }
                        return (
                          <Link
                            className={className}
                            href={cta.href}
                            key={cta.key}
                          >
                            {label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                  <div className="devs__media">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/ink-cube.webp" alt="" />
                  </div>
                  <div className="devs__start">
                    <div className="devs__intro">
                      <p className="headline headline--sm">
                        {tBuilders("start.title")}
                      </p>
                      <p className="devs__lede">
                        {tBuilders("start.description")}
                      </p>
                    </div>
                    <div className="dev-start-list">
                      {builderStartSteps.map((step, index) => {
                        const title = tBuilders(`start.${step.key}.title`);
                        const description = tBuilders(
                          `start.${step.key}.description`
                        );
                        const label = tBuilders(`start.${step.key}.cta`);
                        const cta = step.external ? (
                          <Link
                            className="pill pill--purple"
                            href={step.href}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`${label}. ${t("opensInNewTab")}`}
                          >
                            {label}
                          </Link>
                        ) : (
                          <Link className="pill pill--purple" href={step.href}>
                            {label}
                          </Link>
                        );

                        return (
                          <article className="dev-start" key={step.key}>
                            <span className="dev-start__n">{index + 1}</span>
                            <p className="dev-start__name">{title}</p>
                            <p className="dev-start__desc">{description}</p>
                            {cta}
                          </article>
                        );
                      })}
                    </div>
                  </div>
                  <div className="devs__focus">
                    <p className="headline headline--sm">
                      {tBuilders("expectations.title")}
                    </p>
                    <div className="dev-focus-list">
                      {builderExpectations.map((item) => (
                        <article
                          className="dev-focus dev-focus--info"
                          key={item.title}
                        >
                          <BuilderFeatureIcon icon={item.icon} />
                          <p className="dev-focus__name">{item.title}</p>
                          <p className="dev-focus__desc">{item.description}</p>
                        </article>
                      ))}
                    </div>
                  </div>
                  <div className="devs__focus">
                    <p className="headline headline--sm">
                      {tBuilders("stats.title")}
                    </p>
                    <div className="dev-stat-list">
                      {builderStats.map((stat) => {
                        const label = tBuilders(`stats.${stat.key}`);
                        const body = (
                          <>
                            <p className="dev-stat__value">{stat.value}</p>
                            <p className="dev-stat__label">{label}</p>
                          </>
                        );

                        if ("href" in stat) {
                          return (
                            <a
                              className="dev-stat"
                              href={stat.href}
                              key={stat.key}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={`${stat.value} ${label}. ${t("opensInNewTab")}`}
                            >
                              {body}
                            </a>
                          );
                        }

                        return (
                          <div className="dev-stat" key={stat.key}>
                            {body}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="devs__block">
                    <p className="headline headline--sm">
                      {tBuilders("tools.title")}
                    </p>
                    <div className="dev-links">
                      {resources.map((resource) => {
                        const className = "dev-link";
                        const label = (
                          <>
                            <span className="dev-link__name">
                              {resource.name}
                            </span>
                            <DevLinkGoIcon />
                          </>
                        );
                        if (resource.external) {
                          return (
                            <a
                              className={className}
                              href={resource.href}
                              key={resource.name}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={`${resource.name}. ${t("opensInNewTab")}`}
                            >
                              {label}
                            </a>
                          );
                        }
                        return (
                          <Link
                            className={className}
                            href={resource.href}
                            key={resource.name}
                          >
                            {label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                  <OnlyWithFeatureFlag flag="grantsSection">
                    <div className="devs__grants">
                      <p className="devs__grants-title">
                        {tBuilders("grants.title")}
                      </p>
                      <p className="devs__lede">
                        {tBuilders("grants.description")}
                      </p>
                      <div className="app-list">
                        <a
                          className="app"
                          href={EXTERNAL_LINKS.grant}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <div className="app__icon">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/builders/grant.png" alt="" />
                          </div>
                          <div className="app__meta">
                            <div className="app__copy">
                              <p className="app__name">
                                {tBuilders("applyForGrant.title")}
                              </p>
                              <div className="app__desc">
                                <div className="app__desc-clip">
                                  <p className="app__desc-text">
                                    {tBuilders("applyForGrant.description")}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </a>
                        <a
                          className="app"
                          href={EXTERNAL_LINKS.retroGrant}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <div className="app__icon">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/builders/retro-grant.png" alt="" />
                          </div>
                          <div className="app__meta">
                            <div className="app__copy">
                              <p className="app__name">
                                {tBuilders("applyForRetroGrant.title")}
                              </p>
                              <div className="app__desc">
                                <div className="app__desc-clip">
                                  <p className="app__desc-text">
                                    {tBuilders(
                                      "applyForRetroGrant.description"
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </a>
                      </div>
                    </div>
                  </OnlyWithFeatureFlag>
                </div>
              </section>

              <section
                className="col col--devs-hero"
                data-name="developers-ink"
              >
                <interactive-ascii
                  className="hero-media"
                  value="3"
                  speed="0.9"
                  interaction="0.9"
                  phase="12"
                />
                <Link
                  className="pill pill--glass pill--refractive glass-bar"
                  href={{ pathname: "/builders", query }}
                  aria-current="page"
                >
                  <canvas className="pill__glass" aria-hidden="true" />
                  <span className="pill__label">{t("builtOnInk")}</span>
                </Link>
              </section>

              <section
                className="col col--devs-started"
                data-name="developers-started"
              >
                <div className="col__top">
                  <div className="apps__heading">
                    <span className="pill pill--glass">
                      {tBuilders("started.label")}
                    </span>
                    <OverlayClose
                      label={t("closeDevelopers")}
                      onClick={goHome}
                    />
                  </div>
                  <p className="headline headline--sm headline--narrow">
                    {tBuilders("started.headline")}
                  </p>
                </div>
                <article className="step">
                  <span className="step__n">1</span>
                  <div className="step__body">
                    <p className="step__label">
                      {tBuilders("started.stepDocs")}
                    </p>
                    <Link
                      className="pill pill--gray"
                      href={EXTERNAL_LINKS.documentation}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t("docsCta")}
                    </Link>
                  </div>
                </article>
                <article className="step">
                  <span className="step__n">2</span>
                  <div className="step__body">
                    <p className="step__label">
                      {tBuilders("started.stepFaucet")}
                    </p>
                    <Link className="pill pill--gray" href="/faucet">
                      {tBuilders("started.faucetCta")}
                    </Link>
                  </div>
                </article>
                <article className="step">
                  <span className="step__n">3</span>
                  <div className="step__body">
                    <p className="step__label">
                      {tBuilders("started.stepDeploy")}
                    </p>
                    <Link
                      className="pill pill--gray"
                      href={EXTERNAL_LINKS.documentationDeployContract}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {tBuilders("started.deployCta")}
                    </Link>
                  </div>
                </article>
              </section>
            </div>
          </div>
        </div>

        <div className="bottom-controls">
          <div className="slider glass-bar">
            <canvas className="slider__glass" aria-hidden="true" />
            <div className="slider__items">
              <button
                className="slider__btn"
                type="button"
                data-dir="-1"
                aria-label={t("tuneLess")}
              >
                <span className="slider__icon">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/home-board/icon-minus.svg" alt="" />
                </span>
              </button>
              <div
                className="slider__track"
                role="slider"
                tabIndex={0}
                aria-label={t("tuneLabel")}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={11}
              >
                <span className="slider__line" />
                <span className="slider__thumb" />
              </div>
              <button
                className="slider__btn"
                type="button"
                data-dir="1"
                aria-label={t("tuneMore")}
              >
                <span className="slider__icon">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/home-board/icon-plus.svg" alt="" />
                </span>
              </button>
            </div>
          </div>

          <div className="theme-control glass-bar">
            <canvas className="theme-control__glass" aria-hidden="true" />
            <button
              className="slider__btn theme-toggle"
              type="button"
              aria-pressed={isDark}
              aria-label={isDark ? t("themeLight") : t("themeDark")}
              onClick={toggleTheme}
            >
              <span className="theme-toggle__icons" aria-hidden="true">
                <svg
                  className="theme-toggle__icon theme-toggle__icon--moon"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M16.4 12.35A6.9 6.9 0 0 1 7.65 3.6 6.9 6.9 0 1 0 16.4 12.35Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <svg
                  className="theme-toggle__icon theme-toggle__icon--sun"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <circle
                    cx="10"
                    cy="10"
                    r="3.25"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <path
                    d="M10 1.75V3.5M10 16.5V18.25M18.25 10H16.5M3.5 10H1.75M15.83 4.17 14.6 5.4M5.4 14.6 4.17 15.83M15.83 15.83 14.6 14.6M5.4 5.4 4.17 4.17"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </button>
          </div>
        </div>

        <nav className="nav glass-bar" aria-label={t("primaryNav")}>
          <canvas className="nav__glass" aria-hidden="true" />
          <div className="nav__items">
            <Link
              className="nav__logo"
              href={{ pathname: "/", query }}
              aria-label="Ink"
            >
              <span className="nav__logo-mark" aria-hidden="true">
                <svg viewBox="0 0 30 30" fill="none" shapeRendering="auto">
                  <path
                    fill="currentColor"
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M30 15C30 6.71573 23.2843 -3.62117e-7 15 0 6.71573 3.62117e-7 -3.62117e-7 6.71573 0 15c3.62117e-7 8.2843 6.71573 15 15 15s15-6.7157 15-15ZM17.1409 26.2262c0 1.0176-.8352 1.8448-2.0207 1.8685l-.0986.0005h-.0432C7.756 28.0836 1.90476 22.2251 1.90476 15 1.90476 7.76772 7.7677 1.90479 15 1.90479l.1169.00051c1.3378.02382 2.024.85093 2.024 1.86847 0 1.03561-.9154 1.79766-1.8853 1.79766s-1.0175 0-1.9459.0744c-.9284.07439-1.8884.83645-1.8884 1.869 0 1.03867.8438 1.87512 1.8884 1.87512h8.2336c1.0415 0 1.8853.83645 1.8853 1.86895 0 1.0326-.8438 1.869-1.8853 1.869H8.86143c-1.04464 0-1.88839.8396-1.88839 1.8752 0 1.0325.84375 1.869 1.88839 1.869h6.39417c1.0416 0 1.8853.8364 1.8853 1.872 0 1.0326-.8437 1.869-1.8853 1.869h-1.9459c-1.0446 0-1.8884.8365-1.8884 1.869 0 1.0356.8648 1.7916 1.8884 1.869l.2225.0169c.3602.0275.5571.0425.7542.0507.2373.0099.4751.0099.9993.0099 1.0416 0 1.8552.7651 1.8552 1.7976Z"
                  />
                </svg>
              </span>
            </Link>
            <button
              className="nav__toggle"
              type="button"
              aria-expanded="false"
              aria-controls="mobile-nav-menu"
              aria-label={t("openMenu")}
            >
              <span className="nav__toggle-icon" aria-hidden="true">
                <span />
                <span />
              </span>
            </button>
            <div className="nav__menu" id="mobile-nav-menu">
              <div className="nav__menu-inner">
                <button
                  className="pill"
                  data-w="apps"
                  type="button"
                  aria-expanded={isApps}
                  aria-current={isApps ? "page" : undefined}
                  onClick={toggleApps}
                >
                  {t("appsLabel")}
                </button>
                <button
                  className="pill"
                  data-w="bridge"
                  type="button"
                  aria-expanded={isBridge}
                  aria-current={isBridge ? "page" : undefined}
                  onClick={toggleBridge}
                >
                  {t("bridgeCta")}
                </button>
                <button
                  className="pill"
                  data-w="developers"
                  type="button"
                  aria-expanded={isBuilders}
                  aria-current={isBuilders ? "page" : undefined}
                  onClick={toggleBuilders}
                >
                  {t("developersCta")}
                </button>
                <Link
                  className="pill"
                  data-w="docs"
                  href={EXTERNAL_LINKS.documentation}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("docsCta")}
                </Link>
                <HomeConnectPill label={t("connectCta")} />
              </div>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}
