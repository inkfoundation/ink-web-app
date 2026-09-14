import { RelayKitTheme } from "@reservoir0x/relay-kit-ui";

export const theme: RelayKitTheme = {
  font: "var(--relay-kit-font-family)",
  primaryColor: "var(--relay-kit-primary)",
  focusColor: "var(--relay-kit-primary-hover)",
  subtleBackgroundColor: "var(--relay-kit-subtle-bg)",
  subtleBorderColor: "var(--relay-kit-subtle-border)",
  text: {
    default: "var(--relay-kit-text)",
    subtle: "var(--relay-kit-text-subtle)",
    error: "var(--relay-kit-text-error)",
    success: "var(--relay-kit-text-success)",
  },
  buttons: {
    primary: {
      color: "#fff",
      background: "var(--relay-kit-primary)",
      hover: {
        color: "#fff",
        background: "var(--relay-kit-primary-hover)",
      },
    },
    secondary: {
      color: "var(--relay-kit-text)",
      background: "var(--relay-kit-button-secondary-bg)",
      hover: {
        color: "var(--relay-kit-text)",
        background: "var(--relay-kit-button-secondary-hover)",
      },
    },
    tertiary: {
      color: "var(--relay-kit-text)",
      background: "transparent",
      hover: {
        color: "var(--relay-kit-text)",
        background: "var(--relay-kit-button-secondary-bg)",
      },
    },
    disabled: {
      color: "#fff",
      background: "var(--relay-kit-primary-disabled)",
    },
  },
  input: {
    background: "var(--relay-kit-input-bg)",
    borderRadius: "var(--relay-kit-input-radius)",
    color: "var(--relay-kit-text)",
  },
  skeleton: {
    background: "var(--relay-kit-skeleton-bg)",
  },
  anchor: {
    color: "var(--relay-kit-primary)",
    hover: {
      color: "var(--relay-kit-primary-hover)",
    },
  },
  dropdown: {
    background: "var(--relay-kit-dropdown-bg)",
    borderRadius: "var(--relay-kit-dropdown-radius)",
  },
  widget: {
    background: "var(--relay-kit-widget-bg)",
    borderRadius: "var(--relay-kit-widget-radius)",
    boxShadow: "var(--relay-kit-widget-shadow)",
    card: {
      background: "var(--relay-kit-widget-card-bg)",
      borderRadius: "var(--relay-kit-widget-card-radius)",
      border: "none",
      gutter: "16px",
    },
    selector: {
      background: "var(--relay-kit-widget-selector-bg)",
      hover: {
        background: "var(--relay-kit-widget-selector-hover)",
      },
    },
    swapCurrencyButtonBorderColor: "var(--relay-kit-widget-swap-border)",
    swapCurrencyButtonBorderRadius: "var(--relay-kit-widget-swap-radius)",
  },
  modal: {
    background: "var(--relay-kit-modal-bg)",
    border: "none",
    borderRadius: "var(--relay-kit-modal-radius)",
  },
};
