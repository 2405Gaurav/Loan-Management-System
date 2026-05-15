"use client";

import { useEffect, useState } from "react";

export type FirstSessionState = "pending" | "first" | "repeat";

/**
 * Detects the first visit in the current browser tab/session.
 * - `pending`: before sessionStorage is read (avoid animation flash)
 * - `first`: first visit this session — run intro animation
 * - `repeat`: already seen — render static
 */
export function useFirstSession(storageKey: string): FirstSessionState {
  const [state, setState] = useState<FirstSessionState>("pending");

  useEffect(() => {
    const seen = sessionStorage.getItem(storageKey);
    if (!seen) {
      sessionStorage.setItem(storageKey, "1");
      setState("first");
    } else {
      setState("repeat");
    }
  }, [storageKey]);

  return state;
}
