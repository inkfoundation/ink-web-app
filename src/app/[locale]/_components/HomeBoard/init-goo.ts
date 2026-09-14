const SVG_NS = "http://www.w3.org/2000/svg";
const CONTRAST = 18;
const OFFSET = -7;
const EDGE_GAIN = 0.2104;
const CORNER_GAIN = 1.4;
const WAKE_MS = 520;
const REST = 0.109375;

const GROUPS = [
  {
    container: ".nav",
    items: ".nav__logo, .nav__menu-inner .pill",
    blur: [6, 8] as [number, number],
    media: "(min-width: 641px)",
    before: ".nav__items",
  },
  { container: ".cta-row", items: ".pill", blur: [6, 8] as [number, number] },
  { container: ".tags", items: ".tag", blur: [4.2, 5.5] as [number, number] },
  {
    container: ".app__pills",
    items: ".tag",
    blur: [4.2, 5.5] as [number, number],
  },
  {
    container: ".apps-filter__categories",
    items: ".pill",
    blur: [6, 8] as [number, number],
    media: "(min-width: 641px)",
  },
  {
    container: ".apps-filter__actions",
    items: ".pill",
    blur: [6, 8] as [number, number],
    media: "(min-width: 641px)",
  },
];

type GooGroup = {
  config: (typeof GROUPS)[number];
  container: Element;
  items: Element[];
  rects: { ring: SVGRectElement; body: SVGRectElement }[];
  svg: SVGSVGElement;
  blur: SVGFEGaussianBlurElement;
  layers: SVGGElement[];
  media: MediaQueryList | null;
  visible: boolean;
  enabled: boolean;
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const linearBlur = (tune: number, [min, max]: [number, number]) =>
  min + tune * (max - min);

const blurFor = (tune: number, range: [number, number]) =>
  tune <= REST
    ? (tune / REST) * linearBlur(REST, range)
    : linearBlur(tune, range);

const create = <K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string>
) => {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [name, value] of Object.entries(attrs)) {
    node.setAttribute(name, value);
  }
  return node;
};

export function initGoo(scope: ParentNode): () => void {
  const root = document.documentElement;
  const tuneRoot = scope instanceof Element ? scope : root;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const defs = create("defs", {});
  const defsHost = create("svg", { class: "goo-defs", "aria-hidden": "true" });
  defsHost.append(defs);
  const groups: GooGroup[] = [];

  GROUPS.forEach((config, index) => {
    const containers = [...scope.querySelectorAll(config.container)];
    if (!containers.length) return;

    const filterId = `goo-${index}`;
    const blur = create("feGaussianBlur", {
      in: "SourceGraphic",
      stdDeviation: String(config.blur[0]),
      result: "goo",
    });
    const filter = create("filter", {
      id: filterId,
      x: "-20%",
      y: "-150%",
      width: "140%",
      height: "400%",
      "color-interpolation-filters": "sRGB",
    });
    filter.append(
      blur,
      create("feColorMatrix", {
        in: "goo",
        type: "matrix",
        values: `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${CONTRAST} ${OFFSET}`,
      })
    );
    defs.append(filter);

    containers.forEach((container) => {
      const items = [...container.querySelectorAll(config.items)];
      if (!items.length) return;

      const ringLayer = create("g", { filter: `url(#${filterId})` });
      const bodyLayer = create("g", { filter: `url(#${filterId})` });
      const rects = items.map(() => {
        const ring = create("rect", {
          x: "0",
          y: "0",
          width: "0",
          height: "0",
        });
        const body = create("rect", {
          x: "0",
          y: "0",
          width: "0",
          height: "0",
        });
        ringLayer.append(ring);
        bodyLayer.append(body);
        return { ring, body };
      });

      const svg = create("svg", { class: "goo-layer", "aria-hidden": "true" });
      svg.append(ringLayer, bodyLayer);
      const before = config.before
        ? container.querySelector(config.before)
        : container.firstChild;
      container.insertBefore(svg, before);

      groups.push({
        config,
        container,
        items,
        rects,
        svg,
        blur,
        layers: [ringLayer, bodyLayer],
        media: config.media ? window.matchMedia(config.media) : null,
        visible: true,
        enabled: false,
      });
    });
  });

  if (!groups.length) return () => undefined;
  document.body.append(defsHost);

  const place = (
    rect: SVGRectElement,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    color: string
  ) => {
    rect.setAttribute("x", x.toFixed(2));
    rect.setAttribute("y", y.toFixed(2));
    rect.setAttribute("width", Math.max(0, width).toFixed(2));
    rect.setAttribute("height", Math.max(0, height).toFixed(2));
    rect.setAttribute("rx", Math.max(0, radius).toFixed(2));
    rect.setAttribute("fill", color);
  };

  const syncGroup = (group: GooGroup, tune: number) => {
    const { config, container, items, rects, svg, blur, layers } = group;
    const box = container.getBoundingClientRect();
    if (box.width < 1 || box.height < 1) return;

    const sigma = blurFor(tune, config.blur);
    const edge = sigma * EDGE_GAIN;
    blur.setAttribute("stdDeviation", sigma.toFixed(2));
    const filter =
      sigma > 0.05
        ? `url(#${blur.parentNode && (blur.parentNode as Element).id})`
        : null;
    layers.forEach((layer) => {
      if (filter) layer.setAttribute("filter", filter);
      else layer.removeAttribute("filter");
    });
    svg.setAttribute(
      "viewBox",
      `0 0 ${box.width.toFixed(2)} ${box.height.toFixed(2)}`
    );

    items.forEach((item, index) => {
      const rect = item.getBoundingClientRect();
      const styles = getComputedStyle(item);
      const htmlItem = item as HTMLElement;
      const scale =
        htmlItem.offsetWidth > 0 ? rect.width / htmlItem.offsetWidth : 1;
      const radius = (parseFloat(styles.borderRadius) || 0) * scale;
      const border = (parseFloat(styles.borderTopWidth) || 0) * scale;
      const fill =
        styles.getPropertyValue("--goo-fill").trim() || "transparent";
      const ring = styles.getPropertyValue("--goo-ring").trim() || fill;
      const x = rect.left - box.left;
      const y = rect.top - box.top;
      const inner = edge + border;
      const ringRadius =
        radius - edge - (CORNER_GAIN * sigma * sigma) / Math.max(radius, 1);

      place(
        rects[index].ring,
        x + edge,
        y + edge,
        rect.width - edge * 2,
        rect.height - edge * 2,
        ringRadius,
        ring
      );
      place(
        rects[index].body,
        x + inner,
        y + inner,
        rect.width - inner * 2,
        rect.height - inner * 2,
        ringRadius - border,
        fill
      );
    });
  };

  let frame = 0;
  let awakeUntil = 0;

  const syncAll = () => {
    const tune = clamp01(
      parseFloat(getComputedStyle(tuneRoot).getPropertyValue("--tune"))
    );
    for (const group of groups) {
      if (group.enabled && group.visible) syncGroup(group, tune);
    }
  };

  const tick = () => {
    if (document.hidden) {
      frame = 0;
      return;
    }
    syncAll();
    frame = performance.now() < awakeUntil ? requestAnimationFrame(tick) : 0;
  };

  const wake = () => {
    if (!groups.some((group) => group.enabled)) return;
    awakeUntil = performance.now() + WAKE_MS;
    if (!frame) frame = requestAnimationFrame(tick);
  };

  const setEnabled = (group: GooGroup, enabled: boolean) => {
    if (group.enabled === enabled) return;
    group.enabled = enabled;
    group.container.classList.toggle("is-goo", enabled);
    if (enabled) wake();
  };

  const visibility = new IntersectionObserver(
    (entries) => {
      let changed = false;
      for (const entry of entries) {
        const group = groups.find((item) => item.container === entry.target);
        if (!group || group.visible === entry.isIntersecting) continue;
        group.visible = entry.isIntersecting;
        changed = changed || entry.isIntersecting;
      }
      if (changed) wake();
    },
    { rootMargin: "40px" }
  );

  const resize = new ResizeObserver(wake);
  const itemState = new MutationObserver(wake);
  const mediaCleanups: Array<() => void> = [];

  groups.forEach((group) => {
    setEnabled(group, !group.media || group.media.matches);
    if (group.media) {
      const onChange = (event: MediaQueryListEvent) =>
        setEnabled(group, event.matches);
      group.media.addEventListener("change", onChange);
      mediaCleanups.push(() =>
        group.media?.removeEventListener("change", onChange)
      );
    }
    visibility.observe(group.container);
    resize.observe(group.container);
    group.items.forEach((item) => {
      resize.observe(item);
      itemState.observe(item, {
        attributes: true,
        attributeFilter: ["class", "aria-current"],
      });
    });
  });

  const pointerEvents = [
    "pointerover",
    "pointerout",
    "pointerdown",
    "pointerup",
    "focusin",
    "focusout",
  ];
  const transitionEvents = [
    "transitionrun",
    "transitionend",
    "transitioncancel",
  ];

  for (const event of pointerEvents) {
    document.addEventListener(event, wake, { passive: true });
  }
  for (const event of transitionEvents) {
    document.addEventListener(event, wake);
  }
  window.addEventListener("inktunechange", wake);
  window.addEventListener("inkthemechange", wake);
  window.addEventListener("resize", wake);
  const onVisibility = () => {
    if (!document.hidden) wake();
  };
  document.addEventListener("visibilitychange", onVisibility);
  const themeObserver = new MutationObserver(wake);
  themeObserver.observe(root, { attributeFilter: ["data-theme", "class"] });
  reduceMotion.addEventListener("change", wake);
  void document.fonts?.ready.then(wake);
  wake();

  return () => {
    if (frame) cancelAnimationFrame(frame);
    visibility.disconnect();
    resize.disconnect();
    itemState.disconnect();
    themeObserver.disconnect();
    mediaCleanups.forEach((stop) => stop());
    for (const event of pointerEvents) {
      document.removeEventListener(event, wake);
    }
    for (const event of transitionEvents) {
      document.removeEventListener(event, wake);
    }
    window.removeEventListener("inktunechange", wake);
    window.removeEventListener("inkthemechange", wake);
    window.removeEventListener("resize", wake);
    document.removeEventListener("visibilitychange", onVisibility);
    reduceMotion.removeEventListener("change", wake);
    groups.forEach((group) => {
      group.container.classList.remove("is-goo");
      group.svg.remove();
    });
    defsHost.remove();
  };
}
