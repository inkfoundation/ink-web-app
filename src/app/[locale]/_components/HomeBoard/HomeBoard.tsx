"use client";
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";

import { OnlyWithFeatureFlag } from "@/components/OnlyWithFeatureFlag";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { useRouterQuery } from "@/hooks/useRouterQuery";
import { EXTERNAL_LINKS, Link, usePathname, useRouter } from "@/routing";

import "./interactive-ink";
import "./interactive-ascii";

import { isAppsPath } from "../../apps/_components/filter-apps";
import {
  type InkApp,
  type InkAppNetwork,
  inkApps,
  inkFeaturedApps,
  mainUrl,
} from "../../apps/_components/InkApp";

import { AppsEmptyState, AppsOverlayFilters } from "./AppsOverlayFilters";
import {
  builderExpectations,
  builderFocusKeys,
  builderResources,
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
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function BoardAppCard({
  app,
  network = "Mainnet",
}: {
  app: InkApp;
  network?: InkAppNetwork;
}) {
  const href = mainUrl(app, network) || "/apps";
  const tags = app.tags.slice(0, 2);
  return (
    <a className="app" href={href} target="_blank" rel="noreferrer">
      <div className="app__icon">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={app.imageUrl} alt="" />
      </div>
      <div className="app__meta">
        <div className="app__copy">
          <p className="app__name">{app.name}</p>
          <div className="app__desc">
            <div className="app__desc-clip">
              <p className="app__desc-text">{app.description}</p>
            </div>
          </div>
        </div>
        <div className="app__tags">
          <div className="app__tags-clip">
            <div className="tags">
              {tags.map((tag) => (
                <span className="tag" key={tag}>
                  {formatTag(tag)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}

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
  if (isOverlay) overlayModeRef.current = overlayModeFromPath(pathname);
  const overlayMode = overlayModeRef.current;
  const resources = useMemo(() => builderResources(isMainnet), [isMainnet]);

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

  const apps = useMemo(() => {
    const featuredIds = new Set(inkFeaturedApps.map((app) => app.id));
    return [
      ...inkFeaturedApps,
      ...inkApps.filter((app) => !featuredIds.has(app.id)),
    ];
  }, []);

  useLayoutEffect(() => {
    const html = document.documentElement;
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

  useEffect(() => {
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
                    href={EXTERNAL_LINKS.documentation}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t("docsCta")}
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
                  {t("swapsCta")}
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
                      overlayApps.map((app) => (
                        <BoardAppCard
                          app={app}
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
                          <div className="app__tags">
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
                  <div className="devs__block">
                    <p className="headline headline--sm">
                      {tBuilders("why.title")}
                    </p>
                    <p className="devs__lede">{tAbout("description")}</p>
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
                          <span
                            className="dev-focus__icon"
                            style={
                              {
                                "--dev-icon": `url("${item.icon}")`,
                              } as CSSProperties
                            }
                            aria-hidden="true"
                          />
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
                  <div className="devs__focus">
                    <p className="headline headline--sm">
                      {tBuilders("focus.title")}
                    </p>
                    <p className="devs__lede">
                      {tBuilders("focus.description")}
                    </p>
                    <div className="dev-focus-list">
                      {builderFocusKeys.map((key) => (
                        <article className="dev-focus" key={key}>
                          <p className="dev-focus__name">
                            {tBuilders(`focus.${key}.title`)}
                          </p>
                          <p className="dev-focus__desc">
                            {tBuilders(`focus.${key}.description`)}
                          </p>
                        </article>
                      ))}
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
                  <CodeStory snippetId="builders-deploy-snippet" />
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
                  <span className="pill pill--glass">
                    {tBuilders("started.label")}
                  </span>
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
                      href={EXTERNAL_LINKS.inkKit}
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
              <span className="nav__logo-mark">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/home-board/logo-ink.svg" alt="" />
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
