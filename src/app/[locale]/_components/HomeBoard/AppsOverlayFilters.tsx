"use client";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useModalContext } from "@inkonchain/ink-kit";
import { useTranslations } from "next-intl";

import {
  APP_SUBMISSION_MODAL_KEY,
  AppSubmissionModal,
} from "@/components/Modals/AppSubmissionModal/AppSubmissionModal";
import { useCallbackOnKey } from "@/hooks/useGlobalKey";

import { appCategories } from "../../apps/_components/categories";
import {
  type InkAppFilters,
  type InkAppNetwork,
  inkTags,
} from "../../apps/_components/InkApp";

const NETWORKS: {
  labelKey: "appsNetworkAll" | "appsNetworkMainnet" | "appsNetworkTestnet";
  value: InkAppNetwork;
}[] = [
  { labelKey: "appsNetworkAll", value: "Both" },
  { labelKey: "appsNetworkMainnet", value: "Mainnet" },
  { labelKey: "appsNetworkTestnet", value: "Testnet" },
];

function formatTag(tag: string) {
  return tag
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

const tagOptions = inkTags
  .map((tag) => ({ value: tag, label: formatTag(tag) }))
  .sort((a, b) => a.label.localeCompare(b.label));

function FilterMenu({
  label,
  active,
  count,
  closeOnSelect,
  children,
}: {
  label: string;
  active?: boolean;
  count?: number;
  closeOnSelect?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="apps-filter__menu" ref={ref}>
      <button
        className={`pill${active ? " is-active" : ""}`}
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span>{label}</span>
        {count ? (
          <span className="apps-filter__count">{count}</span>
        ) : (
          <span className="apps-filter__chevron" aria-hidden="true" />
        )}
      </button>
      {open ? (
        <div
          className="apps-filter__panel"
          role="listbox"
          onClick={() => {
            if (closeOnSelect) setOpen(false);
          }}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function AppsOverlayFilters({
  filters,
  enabled,
  onChange,
}: {
  filters: InkAppFilters;
  enabled: boolean;
  onChange: (next: Partial<InkAppFilters>) => void;
}) {
  const t = useTranslations("Home");
  const { openModal } = useModalContext(APP_SUBMISSION_MODAL_KEY);
  const searchRef = useRef<HTMLInputElement>(null);
  const selectedCategory = filters.categories[0];
  const selectedNetwork =
    NETWORKS.find((item) => item.value === (filters.network || "Mainnet")) ||
    NETWORKS[1];

  const selectedTags = useMemo(
    () => tagOptions.filter((tag) => filters.tags.includes(tag.value)),
    [filters.tags]
  );

  useCallbackOnKey({
    key: "/",
    isDisabled: !enabled,
    handler: () => {
      if (!searchRef.current) return false;
      searchRef.current.focus();
      return true;
    },
  });

  const toggleTag = useCallback(
    (tag: string) => {
      const next = filters.tags.includes(tag)
        ? filters.tags.filter((value) => value !== tag)
        : [...filters.tags, tag];
      onChange({ tags: next });
    },
    [filters.tags, onChange]
  );

  const toggleAllTags = useCallback(() => {
    onChange({
      tags: selectedTags.length > 0 ? [] : tagOptions.map((tag) => tag.value),
    });
  }, [onChange, selectedTags.length]);

  return (
    <div className="apps-filter" data-category={filters.categories[0] || "all"}>
      <div className="apps-filter__row">
        <label className="apps-filter__search">
          <span className="apps-filter__search-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle
                cx="7"
                cy="7"
                r="4.25"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M10.2 10.2 13.5 13.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <input
            ref={searchRef}
            type="search"
            value={filters.search}
            placeholder={t("appsSearch")}
            autoComplete="off"
            spellCheck={false}
            onChange={(event) => onChange({ search: event.target.value })}
          />
          <kbd className="apps-filter__slash">/</kbd>
        </label>
        <div className="apps-filter__actions">
          <FilterMenu
            label={t("appsTags")}
            active={selectedTags.length > 0}
            count={selectedTags.length}
          >
            <button
              className={`apps-filter__option${
                selectedTags.length === tagOptions.length ? " is-selected" : ""
              }`}
              type="button"
              onClick={toggleAllTags}
            >
              <span
                className={`apps-filter__check${
                  selectedTags.length > 0 &&
                  selectedTags.length < tagOptions.length
                    ? " is-partial"
                    : ""
                }`}
                aria-hidden="true"
              />
              {t("appsTagsAll")}
            </button>
            {tagOptions.map((tag) => {
              const selected = filters.tags.includes(tag.value);
              return (
                <button
                  className={`apps-filter__option${selected ? " is-selected" : ""}`}
                  key={tag.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleTag(tag.value)}
                >
                  <span className="apps-filter__check" aria-hidden="true" />
                  {tag.label}
                </button>
              );
            })}
          </FilterMenu>
          <FilterMenu
            label={t(selectedNetwork.labelKey)}
            active={selectedNetwork.value !== "Mainnet"}
            closeOnSelect
          >
            {NETWORKS.map((item) => {
              const selected = item.value === selectedNetwork.value;
              return (
                <button
                  className={`apps-filter__option${selected ? " is-selected" : ""}`}
                  key={item.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onChange({ network: item.value })}
                >
                  {t(item.labelKey)}
                </button>
              );
            })}
          </FilterMenu>
          <button
            className="pill pill--purple"
            type="button"
            onClick={() => openModal()}
          >
            {t("appsSubmit")}
          </button>
        </div>
      </div>
      <div
        className="apps-filter__categories"
        role="tablist"
        aria-label={t("appsCategories")}
      >
        {appCategories.map((category) => {
          const value = category.value;
          const selected = value
            ? selectedCategory === value
            : !selectedCategory;
          return (
            <button
              className={`pill${selected ? " is-selected" : ""}`}
              key={category.label}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onChange({ categories: value ? [value] : [] })}
            >
              {category.label}
            </button>
          );
        })}
      </div>
      <AppSubmissionModal />
    </div>
  );
}

export function AppsEmptyState({
  hasSearch,
  hasFilters,
  onResetFilters,
  onResetSearch,
}: {
  hasSearch: boolean;
  hasFilters: boolean;
  onResetFilters: () => void;
  onResetSearch: () => void;
}) {
  const t = useTranslations("Home");
  return (
    <div className="apps-empty">
      <p className="apps-empty__title">{t("appsNoMatches")}</p>
      <p className="apps-empty__hint">
        {hasFilters ? t("appsNoMatchesHint") : t("appsNoMatchesSearch")}
      </p>
      {(hasFilters || hasSearch) && (
        <button
          className="pill pill--purple"
          type="button"
          onClick={hasFilters ? onResetFilters : onResetSearch}
        >
          {hasFilters ? t("appsResetFilters") : t("appsClearSearch")}
        </button>
      )}
    </div>
  );
}
