import { GLASS_FRAGMENT_SHADER } from "./glass-shader";

type RectBox = { left: number; top: number; width: number; height: number };

type Painter = {
  host: Element;
  paint: () => void;
  layout: { rect: RectBox; overlaps: boolean; visible: boolean };
};

const overlaps = (a: RectBox, b: RectBox) =>
  a.width > 0 &&
  b.width > 0 &&
  a.left < b.left + b.width &&
  a.left + a.width > b.left &&
  a.top < b.top + b.height &&
  a.top + a.height > b.top;

const hasLayout = (el: Element) => {
  const rect = el.getBoundingClientRect();
  if (rect.width < 1 || rect.height < 1) return false;
  let node: Element | null = el;
  while (node && node !== document.documentElement) {
    const style = getComputedStyle(node);
    if (style.display === "none" || style.visibility === "hidden") return false;
    node = node.parentElement;
  }
  return true;
};

export function initNavGlass(scope: ParentNode): () => void {
  const root = document.documentElement;
  const bars = scope.querySelectorAll(".glass-bar");
  const heroes = [...scope.querySelectorAll(".hero-media")];
  let hero: Element | null = null;
  if (!bars.length) return () => undefined;

  const themeColors = {
    page: "#ffffff",
    tint: [1, 1, 1],
    accent: [0.72, 0.62, 1],
  };

  const readThemeColors = () => {
    const styles = getComputedStyle(root);
    const readRgb = (name: string, fallback: number[]) => {
      const channels = styles
        .getPropertyValue(name)
        .trim()
        .split(/\s+/)
        .map((channel) => Number(channel) / 255);
      return channels.length === 3 && channels.every(Number.isFinite)
        ? channels
        : fallback;
    };

    // Use the computed page color so we track the winning theme rule
    // (data-theme vs .dark), not a stale specified variable.
    const page = styles.backgroundColor;
    if (page && page !== "rgba(0, 0, 0, 0)" && page !== "transparent") {
      themeColors.page = page;
    }
    themeColors.tint = readRgb("--glass-tint-rgb", themeColors.tint);
    themeColors.accent = readRgb("--glass-accent-rgb", themeColors.accent);
  };

  readThemeColors();

  const snapshot = document.createElement("canvas");
  const snapshotCtx = snapshot.getContext("2d", { alpha: false });
  if (!snapshotCtx) return () => undefined;

  const heroBox: RectBox = { left: 0, top: 0, width: 0, height: 0 };
  let snapshotLive = false;
  let layoutDirty = true;

  const heroSource = () => {
    const inkHost = hero as HTMLElement & { shadowRoot?: ShadowRoot | null };
    const inkCanvas = inkHost?.shadowRoot?.querySelector("canvas");
    if (
      inkCanvas instanceof HTMLCanvasElement &&
      inkCanvas.width &&
      inkCanvas.height
    ) {
      return inkCanvas;
    }
    return null;
  };

  const captureHero = () => {
    snapshotLive = false;
    const source = heroSource();
    if (!source || heroBox.width < 1 || heroBox.height < 1) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(heroBox.width * dpr));
    const height = Math.max(1, Math.round(heroBox.height * dpr));
    if (snapshot.width !== width || snapshot.height !== height) {
      snapshot.width = width;
      snapshot.height = height;
    }
    snapshotCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    snapshotCtx.drawImage(source, 0, 0, heroBox.width, heroBox.height);
    snapshotLive = true;
  };

  const painters: Painter[] = [];

  bars.forEach((host) => {
    const canvas = host.querySelector("canvas");
    if (!(canvas instanceof HTMLCanvasElement)) return;

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      premultipliedAlpha: false,
    });
    if (!gl) return;

    host.classList.add("is-live-glass");

    const backdrop = document.createElement("canvas");
    const backdropCtx = backdrop.getContext("2d", { alpha: false });
    if (!backdropCtx) return;

    const layout = {
      rect: { left: 0, top: 0, width: 0, height: 0 },
      overlaps: false,
      visible: true,
    };

    const vs = gl.createShader(gl.VERTEX_SHADER);
    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;
    gl.shaderSource(
      vs,
      "attribute vec2 position; void main() { gl_Position = vec4(position, 0.0, 1.0); }"
    );
    gl.compileShader(vs);
    gl.shaderSource(fs, GLASS_FRAGMENT_SHADER);
    gl.compileShader(fs);
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      console.error("Shader error:", gl.getShaderInfoLog(fs));
      return;
    }

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const uResolution = gl.getUniformLocation(program, "iResolution");
    const uTexture = gl.getUniformLocation(program, "iChannel0");
    const uGlassTint = gl.getUniformLocation(program, "iGlassTint");
    const uGlassAccent = gl.getUniformLocation(program, "iGlassAccent");
    const uPurpleFringe = gl.getUniformLocation(program, "iPurpleFringe");

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const paint = () => {
      const rect = layout.rect;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = Math.max(1, Math.round(rect.width));
      const cssH = Math.max(1, Math.round(rect.height));
      const w = Math.max(1, Math.round(cssW * dpr));
      const h = Math.max(1, Math.round(cssH * dpr));

      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      if (backdrop.width !== w || backdrop.height !== h) {
        backdrop.width = w;
        backdrop.height = h;
      }

      backdropCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      backdropCtx.fillStyle = themeColors.page;
      backdropCtx.fillRect(0, 0, cssW, cssH);

      if (snapshotLive && layout.overlaps) {
        backdropCtx.drawImage(
          snapshot,
          heroBox.left - rect.left,
          heroBox.top - rect.top,
          heroBox.width,
          heroBox.height
        );
      }

      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        backdrop
      );
      gl.viewport(0, 0, w, h);
      gl.uniform3f(uResolution, w, h, 1.0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(uTexture, 0);
      gl.uniform3f(
        uGlassTint,
        themeColors.tint[0],
        themeColors.tint[1],
        themeColors.tint[2]
      );
      gl.uniform3f(
        uGlassAccent,
        themeColors.accent[0],
        themeColors.accent[1],
        themeColors.accent[2]
      );
      const usePurpleFringe =
        root.dataset.overlay === "builders" &&
        (host.matches(".nav, .slider, .theme-control") ||
          host.closest(".col--devs-hero") !== null);
      gl.uniform1f(uPurpleFringe, usePurpleFringe ? 1 : 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    painters.push({ host, paint, layout });
  });

  const measure = () => {
    if (hero) {
      const rect = hero.getBoundingClientRect();
      heroBox.left = rect.left;
      heroBox.top = rect.top;
      heroBox.width = rect.width;
      heroBox.height = rect.height;
    } else {
      heroBox.width = 0;
      heroBox.height = 0;
    }

    painters.forEach(({ host, layout }) => {
      const rect = host.getBoundingClientRect();
      layout.rect.left = rect.left;
      layout.rect.top = rect.top;
      layout.rect.width = rect.width;
      layout.rect.height = rect.height;
      layout.overlaps = overlaps(layout.rect, heroBox);
    });
    layoutDirty = false;
  };

  const paintGlass = ({ capture = true } = {}) => {
    if (document.hidden || !painters.length) return;
    if (layoutDirty) measure();
    if (capture) captureHero();
    painters.forEach(({ paint, layout }) => {
      if (layout.visible) paint();
    });
  };

  let paintFrame = 0;
  const requestPaint = () => {
    if (paintFrame) return;
    paintFrame = requestAnimationFrame(() => {
      paintFrame = 0;
      paintGlass();
    });
  };

  const onInkFrame = () => {
    if (document.hidden) return;
    if (layoutDirty) measure();
    if (!painters.some(({ layout }) => layout.visible && layout.overlaps))
      return;
    captureHero();
    painters.forEach(({ paint, layout }) => {
      if (layout.visible && layout.overlaps) paint();
    });
  };

  const resolveHero = () => {
    const overlay = root.getAttribute("data-overlay");
    // Chrome only samples page ink when that ink is actually on screen.
    // Apps/bridge have no hero, so nav + footer stay static glass.
    if (overlay && overlay !== "builders") return null;
    const pageHeroes =
      overlay === "builders"
        ? heroes.filter((el) => el.closest(".col--devs-hero"))
        : heroes.filter((el) => !el.closest(".bridge-layer"));
    return pageHeroes.find(hasLayout) ?? null;
  };

  const bindHero = (next: Element | null) => {
    if (hero === next) return;
    hero?.removeEventListener("inkframe", onInkFrame);
    hero = next;
    hero?.addEventListener("inkframe", onInkFrame);
  };

  const syncPageInk = () => {
    const next = resolveHero();
    const changed = hero !== next;
    bindHero(next);
    if (changed) {
      layoutDirty = true;
      requestPaint();
    }
  };

  const onLayoutChange = () => {
    layoutDirty = true;
    syncPageInk();
    requestPaint();
  };

  const onScroll = () => {
    layoutDirty = true;
  };

  window.addEventListener("resize", onLayoutChange);
  window.addEventListener("scroll", onScroll, { passive: true });

  const resizeObserver = new ResizeObserver(() => {
    layoutDirty = true;
    syncPageInk();
    requestPaint();
  });
  painters.forEach(({ host }) => resizeObserver.observe(host));
  heroes.forEach((el) => resizeObserver.observe(el));

  const visibility = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const painter = painters.find(({ host }) => host === entry.target);
      if (painter) painter.layout.visible = entry.isIntersecting;
    }
    layoutDirty = true;
    requestPaint();
  });
  painters.forEach(({ host }) => visibility.observe(host));

  const onTheme = () => {
    readThemeColors();
    requestPaint();
  };
  window.addEventListener("inkthemechange", onTheme);
  // next-themes flips .dark / ink:dark-theme after data-theme. Reading only
  // on inkthemechange bakes the previous theme into the glass canvases.
  const themeObserver = new MutationObserver(onTheme);
  themeObserver.observe(root, { attributeFilter: ["data-theme", "class"] });
  const overlayObserver = new MutationObserver(syncPageInk);
  overlayObserver.observe(root, {
    attributeFilter: [
      "data-overlay",
      "data-bridge-open",
      "data-bridge-closing",
    ],
  });

  syncPageInk();
  requestPaint();

  const slider = scope.querySelector(".slider");
  const track = slider?.querySelector(".slider__track");
  const thumb = slider?.querySelector(".slider__thumb");
  const inks = [
    ...scope.querySelectorAll("interactive-ink, interactive-ascii"),
  ];
  const cleanSlider = initSlider({
    root,
    slider: slider ?? null,
    track: track ?? null,
    inks,
    markLayoutDirty: () => {
      layoutDirty = true;
    },
  });

  if (!slider || !track || !thumb) {
    return () => {
      cleanupGlass();
      cleanSlider();
    };
  }

  function cleanupGlass() {
    if (paintFrame) cancelAnimationFrame(paintFrame);
    window.removeEventListener("resize", onLayoutChange);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("inkthemechange", onTheme);
    themeObserver.disconnect();
    overlayObserver.disconnect();
    hero?.removeEventListener("inkframe", onInkFrame);
    resizeObserver.disconnect();
    visibility.disconnect();
    painters.forEach(({ host }) => host.classList.remove("is-live-glass"));
  }

  return () => {
    cleanupGlass();
    cleanSlider();
  };
}

function initSlider({
  root,
  slider,
  track,
  inks,
  markLayoutDirty,
}: {
  root: HTMLElement;
  slider: Element | null;
  track: Element | null;
  inks: Element[];
  markLayoutDirty: () => void;
}) {
  if (!slider || !(track instanceof HTMLElement)) return () => undefined;

  const REST = 0.109375;
  const STEP = (1 - REST) / 3;
  const STIFFNESS = 165;
  const DAMPING = 8;
  const MASS = 1.2;
  const IMPULSE = 3.4;
  const BOUNCE = 0.4;
  let value =
    Number.parseFloat(getComputedStyle(root).getPropertyValue("--tune")) ||
    0.109375;
  let target = value;
  let velocity = 0;
  let dragging = false;
  let springFrame = 0;
  let lastStamp = 0;

  const clamp = (n: number) => Math.min(1, Math.max(0, n));
  const reduceMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const inkValueFor = (tune: number) => {
    const position = clamp(tune);
    return position <= REST
      ? 1 + (position / REST) * 2
      : 3 + ((position - REST) / (1 - REST)) * 2;
  };

  const writeTune = () => {
    root.style.setProperty("--tune", String(value));
    track.setAttribute("aria-valuenow", String(Math.round(clamp(value) * 100)));
    inks.forEach((ink) => {
      if ("value" in ink) {
        (ink as HTMLElement & { value: number }).value = inkValueFor(value);
      }
    });
    markLayoutDirty();
    window.dispatchEvent(
      new CustomEvent("inktunechange", { detail: { tune: value } })
    );
  };

  const stopSpring = () => {
    if (springFrame) cancelAnimationFrame(springFrame);
    springFrame = 0;
    velocity = 0;
    lastStamp = 0;
  };

  const stepSpring = (stamp: number) => {
    const dt = Math.min(0.032, lastStamp ? (stamp - lastStamp) / 1000 : 1 / 60);
    lastStamp = stamp;
    const accel = (-STIFFNESS * (value - target) - DAMPING * velocity) / MASS;
    velocity += accel * dt;
    value += velocity * dt;
    if (value < 0) {
      value = 0;
      velocity = Math.abs(velocity) * BOUNCE;
    } else if (value > 1) {
      value = 1;
      velocity = -Math.abs(velocity) * BOUNCE;
    }
    writeTune();
    if (Math.abs(velocity) < 0.012 && Math.abs(value - target) < 0.002) {
      value = target;
      stopSpring();
      writeTune();
      return;
    }
    springFrame = requestAnimationFrame(stepSpring);
  };

  const apply = (next: number, { animate = false, impulse = 0 } = {}) => {
    const clamped = clamp(next);
    root.classList.add("is-instant");
    if (!animate || reduceMotion()) {
      stopSpring();
      value = clamped;
      target = clamped;
      writeTune();
      return;
    }
    target = clamped;
    velocity += impulse;
    if (!springFrame) {
      lastStamp = 0;
      springFrame = requestAnimationFrame(stepSpring);
    }
  };

  const valueFromPointer = (clientX: number) => {
    const rect = track.getBoundingClientRect();
    const travel = Math.max(1, rect.width - 24);
    return (clientX - rect.left - 12) / travel;
  };

  const onDirClick = (event: Event) => {
    const btn = event.currentTarget as HTMLElement;
    const dir = Number(btn.dataset.dir);
    const atEnd = (dir < 0 && target <= 0) || (dir > 0 && target >= 1);
    if (atEnd) {
      velocity = 0;
      apply(dir < 0 ? 0 : 1, { animate: true, impulse: dir * IMPULSE });
      return;
    }
    apply(target + dir * STEP, { animate: true, impulse: dir * IMPULSE });
  };

  const dirButtons = [...slider.querySelectorAll("[data-dir]")];
  dirButtons.forEach((btn) => btn.addEventListener("click", onDirClick));

  const onWheel = (event: Event) => {
    const wheel = event as WheelEvent;
    if (window.innerWidth <= 960 || wheel.ctrlKey) return;
    if (Math.abs(wheel.deltaX) > Math.abs(wheel.deltaY)) return;
    wheel.preventDefault();
    const deltaMultiplier =
      wheel.deltaMode === WheelEvent.DOM_DELTA_LINE
        ? 16
        : wheel.deltaMode === WheelEvent.DOM_DELTA_PAGE
          ? window.innerHeight
          : 1;
    apply(target + (wheel.deltaY * deltaMultiplier) / 1200, { animate: true });
  };

  inks.forEach((ink) => {
    ink.addEventListener("wheel", onWheel, { passive: false });
  });

  const onPointerDown = (event: Event) => {
    const pointer = event as PointerEvent;
    if (pointer.button !== 0) return;
    dragging = true;
    slider.classList.add("is-dragging");
    track.setPointerCapture(pointer.pointerId);
    apply(valueFromPointer(pointer.clientX), { animate: true });
  };

  const onPointerMove = (event: Event) => {
    if (!dragging) return;
    apply(valueFromPointer((event as PointerEvent).clientX), { animate: true });
  };

  const endDrag = (event: Event) => {
    if (!dragging) return;
    dragging = false;
    slider.classList.remove("is-dragging");
    const pointer = event as PointerEvent;
    if (track.hasPointerCapture(pointer.pointerId)) {
      track.releasePointerCapture(pointer.pointerId);
    }
  };

  const onKeyDown = (event: Event) => {
    const keyEvent = event as KeyboardEvent;
    const keys: Record<string, number> = {
      ArrowLeft: -STEP,
      ArrowDown: -STEP,
      ArrowRight: STEP,
      ArrowUp: STEP,
      PageDown: -STEP * 2,
      PageUp: STEP * 2,
    };
    if (keyEvent.key in keys) {
      keyEvent.preventDefault();
      apply(value + keys[keyEvent.key]);
    } else if (keyEvent.key === "Home") {
      keyEvent.preventDefault();
      apply(0);
    } else if (keyEvent.key === "End") {
      keyEvent.preventDefault();
      apply(1);
    }
  };

  track.addEventListener("pointerdown", onPointerDown);
  track.addEventListener("pointermove", onPointerMove);
  track.addEventListener("pointerup", endDrag);
  track.addEventListener("pointercancel", endDrag);
  track.addEventListener("keydown", onKeyDown);
  apply(value);

  return () => {
    stopSpring();
    dirButtons.forEach((btn) => btn.removeEventListener("click", onDirClick));
    inks.forEach((ink) => {
      ink.removeEventListener("wheel", onWheel);
    });
    track.removeEventListener("pointerdown", onPointerDown);
    track.removeEventListener("pointermove", onPointerMove);
    track.removeEventListener("pointerup", endDrag);
    track.removeEventListener("pointercancel", endDrag);
    track.removeEventListener("keydown", onKeyDown);
    root.classList.remove("is-instant");
    root.style.removeProperty("--tune");
  };
}
