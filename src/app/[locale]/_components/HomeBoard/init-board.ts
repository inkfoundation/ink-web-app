import { initCodeStory } from "./init-code-story";

const isOverlayOpen = () =>
  document.documentElement.hasAttribute("data-bridge-open") ||
  document.documentElement.hasAttribute("data-bridge-closing");

export function initBoard(scope: ParentNode): () => void {
  const nav = scope.querySelector(".nav");
  const navToggle = nav?.querySelector(".nav__toggle");
  const navMenu = nav?.querySelector(".nav__menu");
  const bottomControls = scope.querySelector(".bottom-controls");
  const mobileNavQuery = window.matchMedia("(max-width: 640px)");
  const bridgeLayer = scope.querySelector(".bridge-layer");
  const bridgeInner = bridgeLayer?.querySelector(".bridge-layer__inner");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const copyButtons = [
    ...scope.querySelectorAll<HTMLButtonElement>("[data-copy]"),
  ];

  const setNavOpen = (isOpen: boolean) => {
    if (!nav || !navToggle || !navMenu) return;
    nav.toggleAttribute("data-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  };

  const closeNavInstantly = () => {
    if (!nav?.hasAttribute("data-open")) return;
    nav.setAttribute("data-no-motion", "");
    setNavOpen(false);
    requestAnimationFrame(() => nav.removeAttribute("data-no-motion"));
  };

  const onToggleClick = () => {
    document.documentElement.removeAttribute("data-mobile-controls-hidden");
    setNavOpen(!nav?.hasAttribute("data-open"));
  };

  const onNavMenuClick = (event: Event) => {
    if ((event.target as Element | null)?.closest("button, a")) {
      setNavOpen(false);
    }
  };

  const onDocumentKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Escape") return;
    if (nav?.hasAttribute("data-open")) {
      closeNavInstantly();
      if (navToggle instanceof HTMLElement) navToggle.focus();
      return;
    }
    if (document.documentElement.hasAttribute("data-bridge-open")) {
      window.dispatchEvent(
        new CustomEvent("ink:close-bridge", { detail: { animate: false } })
      );
    }
  };

  const onDocumentClick = (event: MouseEvent) => {
    if (nav?.hasAttribute("data-open") && !nav.contains(event.target as Node)) {
      setNavOpen(false);
    }
  };

  const setMobileControlsHidden = (isHidden: boolean) => {
    document.documentElement.toggleAttribute(
      "data-mobile-controls-hidden",
      isHidden && mobileNavQuery.matches && !isOverlayOpen()
    );
  };

  const applyColumnInert = () => {
    const overlayOpen = isOverlayOpen();
    scope
      .querySelectorAll<HTMLElement>(
        ".col--about, .col--hero, .col--started, .col--apps"
      )
      .forEach((col) => {
        col.inert = overlayOpen;
      });
    if (bridgeLayer instanceof HTMLElement) {
      bridgeLayer.inert =
        !document.documentElement.hasAttribute("data-bridge-open");
    }
  };

  const applyBridgeState = (isOpen: boolean) => {
    document.documentElement.toggleAttribute("data-bridge-open", isOpen);
    if (isOpen) {
      document.documentElement.removeAttribute("data-bridge-closing");
    }
    applyColumnInert();
  };

  let bridgeCloseTimer = 0;
  let onBridgeTransition: ((event: TransitionEvent) => void) | null = null;

  const stopBridgeClose = () => {
    if (bridgeCloseTimer) {
      window.clearTimeout(bridgeCloseTimer);
      bridgeCloseTimer = 0;
    }
    if (onBridgeTransition && bridgeLayer instanceof HTMLElement) {
      bridgeLayer.removeEventListener("transitionend", onBridgeTransition);
    }
    onBridgeTransition = null;
  };

  const finishBridgeClose = () => {
    stopBridgeClose();
    document.documentElement.removeAttribute("data-bridge-closing");
    applyColumnInert();
  };

  const setBridgeOpen = (isOpen: boolean, { animate = true } = {}) => {
    const html = document.documentElement;
    const hasOpen = html.hasAttribute("data-bridge-open");
    const hasClosing = html.hasAttribute("data-bridge-closing");
    if (isOpen && hasOpen && !hasClosing) return;
    if (!isOpen && !hasOpen && !hasClosing) return;
    if (!isOpen && hasClosing) return;

    stopBridgeClose();

    if (isOpen) {
      closeNavInstantly();
      html.removeAttribute("data-bridge-closing");
      bridgeInner?.querySelectorAll(".app-list").forEach((list) => {
        list.scrollTop = 0;
      });
    }

    const canAnimate =
      animate && !reduceMotion.matches && bridgeLayer instanceof HTMLElement;

    if (!canAnimate) {
      html.removeAttribute("data-bridge-closing");
      html.setAttribute("data-bridge-instant", "");
      applyBridgeState(isOpen);
      requestAnimationFrame(() => {
        html.removeAttribute("data-bridge-instant");
      });
      return;
    }

    if (isOpen) {
      applyBridgeState(true);
      return;
    }

    html.removeAttribute("data-bridge-open");
    html.setAttribute("data-bridge-closing", "");
    applyColumnInert();

    const layer = bridgeLayer;
    onBridgeTransition = (event: TransitionEvent) => {
      if (event.target !== layer || event.propertyName !== "opacity") return;
      finishBridgeClose();
    };
    layer.addEventListener("transitionend", onBridgeTransition);
    bridgeCloseTimer = window.setTimeout(finishBridgeClose, 220);
  };

  const onSetBridge = (event: Event) => {
    const detail = (event as CustomEvent<{ open?: boolean; animate?: boolean }>)
      .detail;
    setBridgeOpen(Boolean(detail?.open), {
      animate: detail?.animate !== false,
    });
  };

  navToggle?.addEventListener("click", onToggleClick);
  navMenu?.addEventListener("click", onNavMenuClick);
  document.addEventListener("keydown", onDocumentKeyDown);
  document.addEventListener("click", onDocumentClick);
  window.addEventListener("ink:set-bridge", onSetBridge);

  let lastScrollY = window.scrollY;
  let scrollFrame = 0;

  const updateMobileControls = () => {
    scrollFrame = 0;
    const currentScrollY = window.scrollY;
    const scrollDelta = currentScrollY - lastScrollY;
    const controlHasFocus =
      (nav?.contains(document.activeElement) ?? false) ||
      (bottomControls?.contains(document.activeElement) ?? false);

    if (!mobileNavQuery.matches || currentScrollY <= 16) {
      setMobileControlsHidden(false);
    } else if (nav?.hasAttribute("data-open") || controlHasFocus) {
      setMobileControlsHidden(false);
    } else if (scrollDelta > 4) {
      setMobileControlsHidden(true);
    } else if (scrollDelta < -4) {
      setMobileControlsHidden(false);
    }

    lastScrollY = currentScrollY;
  };

  const onScroll = () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateMobileControls);
  };

  const onFocusIn = (event: FocusEvent) => {
    if (
      nav?.contains(event.target as Node) ||
      bottomControls?.contains(event.target as Node)
    ) {
      setMobileControlsHidden(false);
    }
  };

  const onMobileChange = (event: MediaQueryListEvent) => {
    lastScrollY = window.scrollY;
    setMobileControlsHidden(false);
    if (!event.matches) closeNavInstantly();
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("focusin", onFocusIn);
  mobileNavQuery.addEventListener("change", onMobileChange);

  const copiedTimers = new Map<HTMLButtonElement, number>();
  const onCopy = async (event: Event) => {
    const btn = event.currentTarget as HTMLButtonElement;
    const explicit = btn.getAttribute("data-copy-text");
    const selector = btn.getAttribute("data-copy");
    const el = selector ? scope.querySelector(selector) : null;
    const text = (explicit ?? el?.textContent ?? "").replace(/\s+$/, "");
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      if (el) {
        const range = document.createRange();
        range.selectNodeContents(el);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        document.execCommand("copy");
        selection?.removeAllRanges();
      }
    }
    btn.dataset.copied = "true";
    btn.setAttribute("aria-label", "Copied");
    const previous = copiedTimers.get(btn);
    if (previous) window.clearTimeout(previous);
    copiedTimers.set(
      btn,
      window.setTimeout(() => {
        delete btn.dataset.copied;
        btn.setAttribute("aria-label", "Copy code");
      }, 1600)
    );
  };

  copyButtons.forEach((btn) => btn.addEventListener("click", onCopy));
  const stopCodeStory = initCodeStory(scope);

  const boardIsOverlay =
    (scope instanceof HTMLElement && scope.hasAttribute("data-bridge-open")) ||
    document.documentElement.hasAttribute("data-bridge-open");
  if (boardIsOverlay) {
    setBridgeOpen(true, { animate: false });
  }

  return () => {
    navToggle?.removeEventListener("click", onToggleClick);
    navMenu?.removeEventListener("click", onNavMenuClick);
    document.removeEventListener("keydown", onDocumentKeyDown);
    document.removeEventListener("click", onDocumentClick);
    window.removeEventListener("ink:set-bridge", onSetBridge);
    window.removeEventListener("scroll", onScroll);
    document.removeEventListener("focusin", onFocusIn);
    mobileNavQuery.removeEventListener("change", onMobileChange);
    copyButtons.forEach((btn) => btn.removeEventListener("click", onCopy));
    copiedTimers.forEach((timer) => window.clearTimeout(timer));
    stopBridgeClose();
    stopCodeStory();
    document.documentElement.removeAttribute("data-mobile-controls-hidden");
    scope.querySelectorAll<HTMLElement>(".col").forEach((col) => {
      col.inert = false;
    });
    if (bridgeLayer instanceof HTMLElement) {
      bridgeLayer.inert = false;
    }
  };
}
