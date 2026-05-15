"use client";

import { useEffect, useRef } from "react";

const DEFAULT_INTERVAL_MS = 8_000;

type Options = {
  /** Poll interval in ms (default 8s). Set 0 to disable polling. */
  intervalMs?: number;
  /** When false, no polling or focus refresh. */
  enabled?: boolean;
};

/**
 * Keeps dashboard data in sync with the server without a manual refresh.
 * - Polls on an interval while the tab is visible
 * - Refetches when the window regains focus or tab becomes visible
 */
export function useLiveRefresh(
  refresh: () => void | Promise<void>,
  options: Options = {}
): void {
  const { intervalMs = DEFAULT_INTERVAL_MS, enabled = true } = options;
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;

  useEffect(() => {
    if (!enabled) return;

    const run = () => {
      void refreshRef.current();
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") run();
    };

    window.addEventListener("focus", run);
    document.addEventListener("visibilitychange", onVisibility);

    let timer: ReturnType<typeof setInterval> | undefined;
    if (intervalMs > 0) {
      timer = setInterval(() => {
        if (document.visibilityState === "visible") run();
      }, intervalMs);
    }

    return () => {
      window.removeEventListener("focus", run);
      document.removeEventListener("visibilitychange", onVisibility);
      if (timer) clearInterval(timer);
    };
  }, [enabled, intervalMs]);
}
