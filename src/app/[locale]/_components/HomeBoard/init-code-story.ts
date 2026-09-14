const LINE_STAGGER_MS = 48;
const OUTPUT_PAUSE_MS = 220;
const LINE_ENTER_MS = 220;
const SCENE_EXIT_MS = 160;
const HOLD_MS = [1500, 1600, 1500, 2400] as const;

type Tone = "text" | "kw" | "str" | "cm" | "ok";

type Token = {
  tone: Tone;
  text: string;
};

type Line = {
  tokens: Token[];
  out?: boolean;
};

type Scene = {
  id: "build" | "test" | "deploy" | "live";
  copy: string;
  lines: Line[];
};

const DEPLOY_COPY = `forge script Deploy \\
    --rpc-url ink \\
    --broadcast`;

const SCENES: Scene[] = [
  {
    id: "build",
    copy: `# foundry.toml
[rpc_endpoints]
ink = "https://rpc-gel.inkonchain.com"`,
    lines: [
      { tokens: [{ tone: "cm", text: "# foundry.toml" }] },
      { tokens: [{ tone: "text", text: "" }] },
      { tokens: [{ tone: "kw", text: "[rpc_endpoints]" }] },
      {
        tokens: [
          { tone: "text", text: "ink = " },
          { tone: "str", text: '"https://rpc-gel.inkonchain.com"' },
        ],
      },
    ],
  },
  {
    id: "test",
    copy: "forge test --fork-url ink",
    lines: [
      {
        tokens: [
          { tone: "cm", text: "$ " },
          { tone: "kw", text: "forge" },
          { tone: "text", text: " test --fork-url " },
          { tone: "str", text: "ink" },
        ],
      },
      { tokens: [{ tone: "text", text: "" }], out: true },
      {
        tokens: [
          { tone: "ok", text: "[PASS]" },
          { tone: "text", text: " test_Deploy() " },
          { tone: "cm", text: "(gas: 47821)" },
        ],
        out: true,
      },
      {
        tokens: [
          { tone: "cm", text: "Suite result: ok. " },
          { tone: "ok", text: "1 passed" },
          { tone: "cm", text: "; 0 failed" },
        ],
        out: true,
      },
    ],
  },
  {
    id: "deploy",
    copy: DEPLOY_COPY,
    lines: [
      {
        tokens: [
          { tone: "cm", text: "$ " },
          { tone: "kw", text: "forge" },
          { tone: "text", text: " script " },
          { tone: "str", text: "Deploy" },
          { tone: "cm", text: " \\" },
        ],
      },
      {
        tokens: [
          { tone: "text", text: "    " },
          { tone: "kw", text: "--rpc-url" },
          { tone: "text", text: " " },
          { tone: "str", text: "ink" },
          { tone: "cm", text: " \\" },
        ],
      },
      {
        tokens: [
          { tone: "text", text: "    " },
          { tone: "kw", text: "--broadcast" },
        ],
      },
    ],
  },
  {
    id: "live",
    copy: DEPLOY_COPY,
    lines: [
      {
        tokens: [
          { tone: "cm", text: "$ " },
          { tone: "kw", text: "forge" },
          { tone: "text", text: " script " },
          { tone: "str", text: "Deploy" },
          { tone: "text", text: " " },
          { tone: "kw", text: "--rpc-url" },
          { tone: "text", text: " " },
          { tone: "str", text: "ink" },
          { tone: "text", text: " " },
          { tone: "kw", text: "--broadcast" },
        ],
      },
      { tokens: [{ tone: "text", text: "" }], out: true },
      {
        tokens: [{ tone: "cm", text: "##### ink" }],
        out: true,
      },
      {
        tokens: [
          { tone: "ok", text: "ONCHAIN EXECUTION COMPLETE & SUCCESSFUL." },
        ],
        out: true,
      },
    ],
  },
];

const isBoardOverlayOpen = () =>
  document.documentElement.hasAttribute("data-bridge-open") ||
  document.documentElement.hasAttribute("data-bridge-closing");

export function initCodeStory(scope: ParentNode): () => void {
  const stops = [
    ...scope.querySelectorAll<HTMLElement>("[data-code-story]"),
  ].map((root) => initOneCodeStory(root));
  return () => stops.forEach((stop) => stop());
}

function initOneCodeStory(root: HTMLElement): () => void {
  const code = root.querySelector<HTMLElement>(".code__snippet");
  const copyBtn = root.querySelector<HTMLButtonElement>(".code__copy");
  const steps = [
    ...root.querySelectorAll<HTMLButtonElement>("[data-code-step]"),
  ];

  if (!code) return () => undefined;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const timers = new Set<number>();
  let sceneIndex = 0;
  let generation = 0;
  let visible = false;
  let paused = false;
  let destroyed = false;
  let revealing = false;

  const wait = (ms: number) =>
    new Promise<void>((resolve) => {
      const id = window.setTimeout(() => {
        timers.delete(id);
        resolve();
      }, ms);
      timers.add(id);
    });

  const later = (fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
    return id;
  };

  const clearTimers = () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };

  const inOverlay = Boolean(root.closest(".col--devs"));
  const canAutoplay = () => {
    if (!visible || paused || document.hidden || reduceMotion.matches) {
      return false;
    }
    return inOverlay ? isBoardOverlayOpen() : !isBoardOverlayOpen();
  };

  const setCopy = (text: string) => {
    copyBtn?.setAttribute("data-copy-text", text);
  };

  const thumb = root.querySelector<HTMLElement>("[data-code-thumb]");

  const moveThumb = (index: number) => {
    const step = steps[index];
    if (!thumb || !step) return;
    const snap = reduceMotion.matches || !thumb.dataset.ready;
    thumb.style.transitionDuration = snap ? "0ms" : "";
    thumb.style.width = `${step.offsetWidth}px`;
    thumb.style.transform = `translate3d(${step.offsetLeft}px, -50%, 0)`;
    if (!thumb.dataset.ready) {
      void thumb.offsetWidth;
      thumb.dataset.ready = "true";
    }
  };

  const setSteps = (index: number) => {
    root.dataset.scene = SCENES[index].id;
    steps.forEach((step, stepIndex) => {
      const selected = stepIndex === index;
      step.setAttribute("aria-current", selected ? "step" : "false");
      step.toggleAttribute("data-current", selected);
      step.toggleAttribute("data-done", stepIndex < index);
    });
    moveThumb(index);
  };

  const tokenNode = (token: Token) => {
    if (token.tone === "text") return document.createTextNode(token.text);
    const span = document.createElement("span");
    span.className = token.tone;
    span.textContent = token.text;
    return span;
  };

  const renderLines = (scene: Scene, pending: boolean) => {
    const fragment = document.createDocumentFragment();
    scene.lines.forEach((line) => {
      const row = document.createElement("span");
      row.className = "code__line";
      if (line.out) row.dataset.out = "";
      if (pending) row.dataset.pending = "";
      if (
        line.tokens.length === 0 ||
        line.tokens.every((token) => token.text === "")
      ) {
        row.innerHTML = "&nbsp;";
      } else {
        line.tokens.forEach((token) => row.append(tokenNode(token)));
      }
      fragment.append(row);
    });
    code.replaceChildren(fragment);
  };

  const placeCaret = (line: HTMLElement) => {
    code.querySelector(".code__caret")?.remove();
    const caret = document.createElement("span");
    caret.className = "code__caret";
    caret.setAttribute("aria-hidden", "true");
    line.append(caret);
  };

  const restCaret = () => {
    const lines = [...code.querySelectorAll<HTMLElement>(".code__line")];
    const lastVisible =
      lines.findLast((line) => !line.hasAttribute("data-pending")) ??
      lines.at(-1);
    if (lastVisible) placeCaret(lastVisible);
  };

  const armAdvance = () => {
    if (revealing || !canAutoplay()) return;
    later(() => {
      void showScene((sceneIndex + 1) % SCENES.length, "play");
    }, HOLD_MS[sceneIndex]);
  };

  const showScene = async (index: number, mode: "play" | "jump") => {
    if (destroyed) return;
    const gen = ++generation;
    clearTimers();
    revealing = mode === "play" && !reduceMotion.matches;
    sceneIndex = index;
    const scene = SCENES[index];
    setSteps(index);
    setCopy(scene.copy);

    const instant = mode === "jump" || reduceMotion.matches;
    const isFirstPaint =
      !code.dataset.ready && scene.id === root.dataset.scene && mode === "play";

    if (isFirstPaint) {
      code.dataset.ready = "true";
      revealing = false;
      restCaret();
      if (!instant) armAdvance();
      return;
    }

    const hasLines = code.childElementCount > 0;

    if (!instant && hasLines && code.dataset.ready === "true") {
      root.dataset.exit = "";
      await wait(SCENE_EXIT_MS);
      if (destroyed || gen !== generation) return;
      delete root.dataset.exit;
    }

    renderLines(scene, !instant);
    code.dataset.ready = "true";

    if (instant) {
      revealing = false;
      restCaret();
      armAdvance();
      return;
    }

    void code.offsetWidth;
    const lines = [...code.querySelectorAll<HTMLElement>(".code__line")];
    let delay = 0;
    let sawOutput = false;

    lines.forEach((line) => {
      const isOutput = line.dataset.out !== undefined;
      if (isOutput && !sawOutput) {
        delay += OUTPUT_PAUSE_MS;
        sawOutput = true;
      }

      later(() => {
        if (gen !== generation) return;
        line.removeAttribute("data-pending");
        placeCaret(line);
      }, delay);

      delay += LINE_STAGGER_MS;
    });

    later(() => {
      if (gen !== generation) return;
      restCaret();
      revealing = false;
      armAdvance();
    }, delay + LINE_ENTER_MS);
  };

  const onStepClick = (event: Event) => {
    const button = event.currentTarget as HTMLButtonElement;
    const index = Number(button.dataset.codeStep);
    if (!Number.isInteger(index) || index === sceneIndex) return;
    void showScene(index, "jump");
  };

  const onPointerEnter = () => {
    paused = true;
    if (!revealing) clearTimers();
  };

  const onPointerLeave = () => {
    if (root.matches(":focus-within")) return;
    paused = false;
    armAdvance();
  };

  const onFocusIn = () => {
    paused = true;
    if (!revealing) clearTimers();
  };

  const onFocusOut = (event: FocusEvent) => {
    const next = event.relatedTarget;
    if (next instanceof Node && root.contains(next)) return;
    paused = false;
    armAdvance();
  };

  const onVisibility = () => {
    if (document.hidden) {
      if (!revealing) clearTimers();
      return;
    }
    armAdvance();
  };

  const onReduceMotion = () => {
    void showScene(sceneIndex, "jump");
  };

  const onOverlay = () => {
    if (isBoardOverlayOpen()) {
      if (!revealing) clearTimers();
      return;
    }
    armAdvance();
  };

  const appsObserver = new MutationObserver(onOverlay);
  appsObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-bridge-open", "data-bridge-closing"],
  });

  const io = new IntersectionObserver(
    ([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      if (visible) {
        if (!code.dataset.ready) {
          void showScene(0, reduceMotion.matches ? "jump" : "play");
          return;
        }
        armAdvance();
        return;
      }
      if (!revealing) clearTimers();
    },
    { threshold: 0.45 }
  );

  const stepsRow = root.querySelector(".code__steps");
  const thumbObserver =
    stepsRow && thumb ? new ResizeObserver(() => moveThumb(sceneIndex)) : null;
  if (stepsRow && thumbObserver) thumbObserver.observe(stepsRow);

  steps.forEach((step) => step.addEventListener("click", onStepClick));
  root.addEventListener("pointerenter", onPointerEnter);
  root.addEventListener("pointerleave", onPointerLeave);
  root.addEventListener("focusin", onFocusIn);
  root.addEventListener("focusout", onFocusOut);
  document.addEventListener("visibilitychange", onVisibility);
  reduceMotion.addEventListener("change", onReduceMotion);
  io.observe(root);
  moveThumb(0);

  return () => {
    destroyed = true;
    generation += 1;
    clearTimers();
    io.disconnect();
    appsObserver.disconnect();
    thumbObserver?.disconnect();
    steps.forEach((step) => step.removeEventListener("click", onStepClick));
    root.removeEventListener("pointerenter", onPointerEnter);
    root.removeEventListener("pointerleave", onPointerLeave);
    root.removeEventListener("focusin", onFocusIn);
    root.removeEventListener("focusout", onFocusOut);
    document.removeEventListener("visibilitychange", onVisibility);
    reduceMotion.removeEventListener("change", onReduceMotion);
  };
}
