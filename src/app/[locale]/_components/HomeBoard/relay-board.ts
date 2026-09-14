import "./relay-board.css";

export { relayBoardTheme, theme } from "./relay-board-theme";

/**
 * Homepage board restyle for the Relay swap widget.
 *
 * The live widget is still out (pending the foundation API key). This kit
 * is the last board-matching restyle from `3fa1e41`, ready to drop back
 * in without hunting through `home-board.css`.
 *
 * ## Remount
 *
 * 1. Restore `src/contexts/RelayProvider.tsx` and wrap children in
 *    `Providers.tsx` again (inside `WalletProvider`).
 * 2. Point the provider at this theme:
 *
 *        import { relayBoardTheme } from "@/app/[locale]/_components/HomeBoard/relay-board";
 *        <RelayKitProvider theme={relayBoardTheme} options={...}>
 *
 *    Or keep the old path: `src/util/relay-kit-theme` re-exports `theme`.
 * 3. Restore `RelayKitUI` / `useAdaptedWallet` from `7418aca^`. Keep the
 *    `bridge__history` class on the history row. Do **not** restore
 *    `RelayKitUI.css` — it maps ink-kit tokens and fights this kit.
 *    Keep the Relay package stylesheet:
 *    `import "@reservoir0x/relay-kit-ui/styles.css"`.
 * 4. Mount the widget in the `/bridge` overlay, ahead of the catalog:
 *
 *        <section className="col col--relay" data-name="relay">
 *          <div className="bridge__inner">
 *            <div className="col__top">
 *              <span className="pill pill--glass">{t("bridgeCta")}</span>
 *            </div>
 *            <div className="bridge__widget relay-board">
 *              <RelayKitUI />
 *            </div>
 *          </div>
 *        </section>
 *
 * 5. Drop `col--catalog` from the bridges section so it becomes the
 *    narrow side list again. This CSS restores the 943 / 242 split
 *    whenever `.col--relay` or `.col--bridge` is in the overlay.
 *
 * Restyle by editing `relay-board.css` (chrome Relay's theme cannot
 * reach) and `relay-board-theme.ts` (colors, type, card/modal tokens).
 */
export const RELAY_BOARD_RESTORE = {
  overlayClass: "col col--relay",
  widgetClass: "bridge__widget relay-board",
  themeExport: "relayBoardTheme",
} as const;
