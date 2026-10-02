"use client";

import { useEffect, useId, useRef, useState } from "react";

type RankOption<T extends string> = {
  value: T;
  label: string;
};

export function RankSort<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: RankOption<T>[];
  onChange: (value: T) => void;
}) {
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<{ top: number; left: number }>();
  const selected =
    options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;

    function close() {
      setOpen(false);
    }

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) close();
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [open]);

  function toggle() {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const width = 168;
    const left = Math.min(rect.left, window.innerWidth - width - 8);
    setMenuStyle({ top: rect.bottom + 6, left: Math.max(8, left) });
    setOpen((current) => !current);
  }

  return (
    <div className="rank-sort" ref={rootRef}>
      <button
        ref={triggerRef}
        className="rank-sort__trigger"
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={menuId}
        onClick={toggle}
      >
        <span className="rank-sort__label">{selected?.label}</span>
        <span className="rank-sort__chevron" aria-hidden="true" />
      </button>
      {open && menuStyle ? (
        <div
          id={menuId}
          className="rank-sort__menu"
          role="listbox"
          style={{ top: menuStyle.top, left: menuStyle.left }}
        >
          {options.map((option) => (
            <button
              key={option.value}
              className={
                option.value === value
                  ? "rank-sort__option is-selected"
                  : "rank-sort__option"
              }
              type="button"
              role="option"
              aria-selected={option.value === value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
