import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * `false` during SSR and the hydration render, `true` right after. Use it to
 * gate values that only exist on the client (e.g. next-themes'
 * `resolvedTheme`, which is `undefined` on the server) so the first client
 * render matches the server HTML; React re-renders with the real value as
 * soon as hydration completes.
 */
export function useIsHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
