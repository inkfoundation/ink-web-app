const COLUMN_NAMES = [
  "about",
  "hero",
  "started",
  "apps",
  "tokens",
  "nfts",
  "developers",
  "developers-ink",
  "developers-started",
] as const;

type ColumnName = (typeof COLUMN_NAMES)[number];

const DEFAULT_WEIGHTS: Record<ColumnName, number> = {
  about: 521,
  hero: 422,
  started: 242,
  apps: 310,
  tokens: 280,
  nfts: 280,
  developers: 521,
  "developers-ink": 422,
  "developers-started": 242,
};

const MIN_PX: Record<ColumnName, number> = {
  about: 380,
  hero: 280,
  started: 280,
  apps: 280,
  tokens: 240,
  nfts: 240,
  developers: 380,
  "developers-ink": 280,
  "developers-started": 280,
};

const isColumnName = (value: string | undefined): value is ColumnName =>
  COLUMN_NAMES.some((name) => name === value);

const isStackWrap = (el: HTMLElement) =>
  el.classList.contains("board-feed") || el.classList.contains("board-market");

const isPassthrough = (el: HTMLElement) =>
  isStackWrap(el) && getComputedStyle(el).display === "contents";

export function initBoardResize(scope: ParentNode): () => void {
  const board = scope.querySelector<HTMLElement>(":scope .board");
  const rows = [
    board,
    scope.querySelector<HTMLElement>(":scope .bridge-layer__inner"),
  ].filter((row): row is HTMLElement => row !== null);
  if (!board || rows.length === 0) return () => {};

  const weights: Record<ColumnName, number> = { ...DEFAULT_WEIGHTS };

  const flattenRowItems = (parent: HTMLElement): HTMLElement[] => {
    const items: HTMLElement[] = [];
    for (const child of parent.children) {
      if (!(child instanceof HTMLElement)) continue;
      if (isPassthrough(child)) items.push(...flattenRowItems(child));
      else items.push(child);
    }
    return items;
  };

  const rowOf = (el: HTMLElement) => {
    let node: HTMLElement | null = el;
    while (node) {
      if (rows.includes(node)) return node;
      node = node.parentElement;
    }
    return null;
  };

  const rowHandles = (row: HTMLElement) =>
    flattenRowItems(row).filter(
      (el): el is HTMLButtonElement =>
        el instanceof HTMLButtonElement && el.classList.contains("col-resize")
    );

  const rowColumnEls = (row: HTMLElement) =>
    flattenRowItems(row).filter((el) => el.classList.contains("col"));

  const columnFor = (name: ColumnName) => {
    for (const row of rows) {
      const column = rowColumnEls(row).find((el) => el.dataset.name === name);
      if (column) return column;
    }
    return null;
  };

  const apply = () => {
    for (const name of COLUMN_NAMES) {
      columnFor(name)?.style.setProperty(
        `--w-${name}`,
        weights[name].toFixed(2)
      );
    }
    placeHandles();
  };

  const ancestorTransformed = (el: HTMLElement) => {
    let node: HTMLElement | null = el;
    while (node) {
      const transform = getComputedStyle(node).transform;
      if (transform && transform !== "none") return true;
      node = node.parentElement;
    }
    return false;
  };

  function placeHandles() {
    const narrow = window.matchMedia("(max-width: 960px)").matches;
    for (const row of rows) {
      const rowStyle = getComputedStyle(row);
      const rowUnready =
        narrow ||
        rowStyle.display === "none" ||
        rowStyle.visibility === "hidden" ||
        ancestorTransformed(row);
      const rowRect = row.getBoundingClientRect();
      for (const handle of rowHandles(row)) {
        const pair = rowUnready ? null : pairFromHandle(handle);
        const leftRect = pair?.leftCol.getBoundingClientRect();
        const rightRect = pair?.rightCol.getBoundingClientRect();
        const gap = leftRect && rightRect ? rightRect.left - leftRect.right : 0;
        const mid =
          leftRect && rightRect
            ? (leftRect.right + rightRect.left) / 2 - rowRect.left
            : 0;
        const inGap =
          !!leftRect &&
          !!rightRect &&
          leftRect.width >= 8 &&
          rightRect.width >= 8 &&
          gap >= 4 &&
          mid >= 8 &&
          mid <= rowRect.width - 8;
        if (!pair || !inGap) {
          handle.removeAttribute("data-placed");
          continue;
        }
        handle.style.left = `${mid}px`;
        handle.dataset.placed = "";
      }
    }
  }

  const adjacentColumn = (
    items: HTMLElement[],
    from: number,
    dir: -1 | 1,
    visibleOnly: boolean
  ) => {
    for (let index = from + dir; index >= 0 && index < items.length; index += dir) {
      const node = items[index];
      if (!node.classList.contains("col") || !isColumnName(node.dataset.name)) {
        continue;
      }
      if (visibleOnly && getComputedStyle(node).display === "none") continue;
      return node;
    }
    return null;
  };

  const pairFromHandle = (handle: HTMLButtonElement) => {
    const row = rowOf(handle);
    if (!row) return null;
    const items = flattenRowItems(row);
    const from = items.indexOf(handle);
    if (from < 0) return null;
    const leftCol = adjacentColumn(items, from, -1, false);
    if (!leftCol || getComputedStyle(leftCol).display === "none") return null;
    const left = leftCol.dataset.name;
    if (!isColumnName(left)) return null;
    const rightCol = adjacentColumn(items, from, 1, true);
    if (!rightCol) return null;
    const right = rightCol.dataset.name;
    if (!isColumnName(right)) return null;
    return { left, right, leftCol, rightCol };
  };

  type RowColumn = {
    name: ColumnName;
    el: HTMLElement;
    startPx: number;
  };

  const rowColumns = (row: HTMLElement): RowColumn[] =>
    rowColumnEls(row).flatMap((el) => {
      if (
        !isColumnName(el.dataset.name) ||
        getComputedStyle(el).display === "none"
      ) {
        return [];
      }
      const startPx = el.getBoundingClientRect().width;
      if (startPx <= 0) return [];
      return [{ name: el.dataset.name, el, startPx }];
    });

  const scaleToFill = (others: RowColumn[], space: number) => {
    const targets = new Map<ColumnName, number>();
    let open = [...others];
    let remaining = space;

    while (open.length > 0) {
      const basis = open.reduce((sum, column) => sum + column.startPx, 0);
      const pinned: RowColumn[] = [];
      const next = new Map<ColumnName, number>();
      for (const column of open) {
        const share =
          basis > 0
            ? (column.startPx / basis) * remaining
            : remaining / open.length;
        if (share < MIN_PX[column.name]) pinned.push(column);
        else next.set(column.name, share);
      }
      if (pinned.length === 0 || pinned.length === open.length) {
        const settled = pinned.length === 0 ? next : null;
        for (const column of open) {
          targets.set(
            column.name,
            settled?.get(column.name) ?? MIN_PX[column.name]
          );
        }
        break;
      }
      for (const column of pinned) {
        targets.set(column.name, MIN_PX[column.name]);
        remaining -= MIN_PX[column.name];
      }
      open = open.filter(
        (column) =>
          !pinned.some((pinnedColumn) => pinnedColumn.name === column.name)
      );
      if (remaining < 0) remaining = 0;
    }

    return targets;
  };

  type SavedLayout = {
    signature: string;
    ratios: Map<ColumnName, number>;
  };

  const savedLayouts = new WeakMap<HTMLElement, SavedLayout>();

  const contentWidth = (row: HTMLElement, count: number) => {
    const style = getComputedStyle(row);
    const pad =
      Number.parseFloat(style.paddingLeft) +
      Number.parseFloat(style.paddingRight);
    const gap = Number.parseFloat(style.columnGap) || 0;
    return row.clientWidth - pad - gap * Math.max(count - 1, 0);
  };

  const writeWidths = (
    row: HTMLElement,
    columns: RowColumn[],
    widths: Map<ColumnName, number>
  ) => {
    const total = [...widths.values()].reduce((sum, value) => sum + value, 0);
    const ratios = new Map<ColumnName, number>();
    for (const column of columns) {
      const px = widths.get(column.name);
      if (px === undefined || total <= 0) continue;
      ratios.set(column.name, px / total);
      column.el.style.flex = `0 0 ${px.toFixed(2)}px`;
    }
    savedLayouts.set(row, {
      signature: columns.map((column) => column.name).join("|"),
      ratios,
    });
    placeHandles();
  };

  const clearRowWidths = (row: HTMLElement) => {
    savedLayouts.delete(row);
    for (const column of rowColumnEls(row)) {
      column.style.removeProperty("flex");
    }
  };

  const fitRow = (
    row: HTMLElement,
    columns: RowColumn[],
    active: ColumnName,
    desiredActivePx: number
  ) => {
    const totalPx = columns.reduce((sum, column) => sum + column.startPx, 0);
    const others = columns.filter((column) => column.name !== active);
    if (totalPx <= 0 || others.length === 0) return;

    const othersMin = others.reduce(
      (sum, column) => sum + MIN_PX[column.name],
      0
    );
    const activePx = Math.min(
      Math.max(desiredActivePx, MIN_PX[active]),
      Math.max(MIN_PX[active], totalPx - othersMin)
    );
    const widths = scaleToFill(others, totalPx - activePx);
    widths.set(active, activePx);
    writeWidths(row, columns, widths);
  };

  const snapshotRow = (handle: HTMLButtonElement) => {
    const row = rowOf(handle);
    const pair = pairFromHandle(handle);
    if (!row || !pair) return null;
    const columns = rowColumns(row);
    if (!columns.some((column) => column.name === pair.left)) return null;
    return { row, columns, active: pair.left };
  };

  // Same spring as the radius slider in init-nav-glass.ts.
  const STIFFNESS = 165;
  const DAMPING = 8;
  const MASS = 1.2;
  const BOUNCE = 0.4;
  const IMPULSE = 3.4;
  const SLIDER_STEP = (1 - 0.109375) / 3;

  type WidthSpring = {
    row: HTMLElement;
    columns: RowColumn[];
    active: ColumnName;
    min: number;
    max: number;
    value: number;
    target: number;
    velocity: number;
    frame: number;
    lastStamp: number;
  };

  let motion: WidthSpring | null = null;

  const reduceMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const columnLimits = (columns: RowColumn[], active: ColumnName) => {
    const totalPx = columns.reduce((sum, column) => sum + column.startPx, 0);
    const othersMin = columns.reduce(
      (sum, column) =>
        column.name === active ? sum : sum + MIN_PX[column.name],
      0
    );
    const min = MIN_PX[active];
    return { min, max: Math.max(min, totalPx - othersMin) };
  };

  const stopMotion = () => {
    if (!motion?.frame) return;
    cancelAnimationFrame(motion.frame);
    motion.frame = 0;
    motion.velocity = 0;
    motion.lastStamp = 0;
  };

  const writeMotion = () => {
    if (!motion) return;
    const px = motion.min + motion.value * (motion.max - motion.min);
    fitRow(motion.row, motion.columns, motion.active, px);
  };

  const stepMotion = (stamp: number) => {
    if (!motion) return;
    const dt = Math.min(
      0.032,
      motion.lastStamp ? (stamp - motion.lastStamp) / 1000 : 1 / 60
    );
    motion.lastStamp = stamp;
    const accel =
      (-STIFFNESS * (motion.value - motion.target) -
        DAMPING * motion.velocity) /
      MASS;
    motion.velocity += accel * dt;
    motion.value += motion.velocity * dt;
    if (motion.value < 0) {
      motion.value = 0;
      motion.velocity = Math.abs(motion.velocity) * BOUNCE;
    } else if (motion.value > 1) {
      motion.value = 1;
      motion.velocity = -Math.abs(motion.velocity) * BOUNCE;
    }
    writeMotion();
    if (
      Math.abs(motion.velocity) < 0.012 &&
      Math.abs(motion.value - motion.target) < 0.002
    ) {
      motion.value = motion.target;
      motion.frame = 0;
      motion.velocity = 0;
      motion.lastStamp = 0;
      writeMotion();
      return;
    }
    motion.frame = requestAnimationFrame(stepMotion);
  };

  const startMotion = () => {
    if (!motion || motion.frame) return;
    motion.lastStamp = 0;
    motion.frame = requestAnimationFrame(stepMotion);
  };

  const seek = (next: number, impulse = 0) => {
    if (!motion) return;
    const clamped = Math.min(1, Math.max(0, next));
    if (reduceMotion()) {
      stopMotion();
      motion.value = clamped;
      motion.target = clamped;
      writeMotion();
      return;
    }
    motion.target = clamped;
    motion.velocity += impulse;
    startMotion();
  };

  const beginMotion = (
    row: HTMLElement,
    columns: RowColumn[],
    active: ColumnName,
    activePx: number
  ) => {
    stopMotion();
    const { min, max } = columnLimits(columns, active);
    const span = max - min;
    const value =
      span > 0 ? Math.min(1, Math.max(0, (activePx - min) / span)) : 0;
    motion = {
      row,
      columns,
      active,
      min,
      max,
      value,
      target: value,
      velocity: 0,
      frame: 0,
      lastStamp: 0,
    };
  };

  let drag: {
    startX: number;
    startValue: number;
    handle: HTMLButtonElement;
  } | null = null;

  const endDrag = () => {
    if (!drag) return;
    drag.handle.removeAttribute("data-active");
    delete board.dataset.resizing;
    drag = null;
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", endDrag);
    window.removeEventListener("pointercancel", endDrag);
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!drag || !motion) return;
    const span = motion.max - motion.min;
    const next =
      drag.startValue + (span > 0 ? (event.clientX - drag.startX) / span : 0);
    seek(next);
  };

  const onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0) return;
    if (window.matchMedia("(max-width: 960px)").matches) return;
    const handle = event.currentTarget;
    if (!(handle instanceof HTMLButtonElement)) return;
    const snapshot = snapshotRow(handle);
    if (!snapshot) return;
    const active = snapshot.columns.find(
      (column) => column.name === snapshot.active
    );
    if (!active) return;

    beginMotion(
      snapshot.row,
      snapshot.columns,
      snapshot.active,
      active.startPx
    );
    drag = {
      startX: event.clientX,
      startValue: motion?.value ?? 0,
      handle,
    };
    handle.dataset.active = "";
    board.dataset.resizing = "";
    handle.setPointerCapture(event.pointerId);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    const handle = event.currentTarget;
    if (!(handle instanceof HTMLButtonElement)) return;
    const snapshot = snapshotRow(handle);
    if (!snapshot) return;
    const active = snapshot.columns.find(
      (column) => column.name === snapshot.active
    );
    if (!active) return;

    event.preventDefault();
    const stepPx = event.shiftKey ? 64 : 28;
    const dir = event.key === "ArrowRight" ? 1 : -1;
    if (
      !motion ||
      motion.row !== snapshot.row ||
      motion.active !== snapshot.active ||
      !motion.frame
    ) {
      beginMotion(
        snapshot.row,
        snapshot.columns,
        snapshot.active,
        active.startPx
      );
    }
    if (!motion) return;
    const span = motion.max - motion.min;
    const step = span > 0 ? (dir * stepPx) / span : 0;
    seek(motion.target + step, dir * IMPULSE * (Math.abs(step) / SLIDER_STEP));
  };

  const onDoubleClick = (event: MouseEvent) => {
    const handle = event.currentTarget;
    if (!(handle instanceof HTMLButtonElement)) return;
    const row = rowOf(handle);
    if (!row) return;
    stopMotion();
    motion = null;
    for (const column of rowColumnEls(row)) {
      if (!isColumnName(column.dataset.name)) continue;
      weights[column.dataset.name] = DEFAULT_WEIGHTS[column.dataset.name];
    }
    clearRowWidths(row);
    apply();
  };

  const rescaleSaved = (row: HTMLElement) => {
    const saved = savedLayouts.get(row);
    if (!saved) return;
    if (window.matchMedia("(max-width: 960px)").matches) {
      for (const column of rowColumnEls(row)) {
        column.style.removeProperty("flex");
      }
      return;
    }
    const columns = rowColumns(row);
    const signature = columns.map((column) => column.name).join("|");
    if (signature !== saved.signature) {
      clearRowWidths(row);
      return;
    }
    const available = contentWidth(row, columns.length);
    if (available <= 0) return;
    const seeded = columns.map((column) => ({
      ...column,
      startPx: saved.ratios.get(column.name) ?? 1,
    }));
    writeWidths(row, columns, scaleToFill(seeded, available));
  };

  const resizeObserver = new ResizeObserver(() => {
    if (drag || motion?.frame) {
      placeHandles();
      return;
    }
    for (const row of rows) rescaleSaved(row);
    placeHandles();
  });
  for (const row of rows) resizeObserver.observe(row);
  for (const name of COLUMN_NAMES) {
    const column = columnFor(name);
    if (column) resizeObserver.observe(column);
  }
  apply();

  const refreshHandles = () => {
    placeHandles();
    requestAnimationFrame(() => {
      placeHandles();
      requestAnimationFrame(placeHandles);
    });
  };
  const bridgeLayer = scope.querySelector<HTMLElement>(":scope .bridge-layer");
  const onBridgeTransition = (event: TransitionEvent) => {
    if (event.target !== bridgeLayer) return;
    if (
      event.propertyName !== "transform" &&
      event.propertyName !== "opacity"
    ) {
      return;
    }
    refreshHandles();
  };
  bridgeLayer?.addEventListener("transitionend", onBridgeTransition);
  const overlayObserver = new MutationObserver(() => refreshHandles());
  overlayObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: [
      "data-bridge-open",
      "data-overlay",
      "data-bridge-closing",
      "data-bridge-instant",
    ],
  });

  const handles = rows.flatMap((row) => rowHandles(row));
  const cleanups = handles.map((handle) => {
    handle.addEventListener("pointerdown", onPointerDown);
    handle.addEventListener("keydown", onKeyDown);
    handle.addEventListener("dblclick", onDoubleClick);
    return () => {
      handle.removeEventListener("pointerdown", onPointerDown);
      handle.removeEventListener("keydown", onKeyDown);
      handle.removeEventListener("dblclick", onDoubleClick);
    };
  });

  return () => {
    resizeObserver.disconnect();
    overlayObserver.disconnect();
    bridgeLayer?.removeEventListener("transitionend", onBridgeTransition);
    stopMotion();
    endDrag();
    for (const cleanup of cleanups) cleanup();
  };
}
