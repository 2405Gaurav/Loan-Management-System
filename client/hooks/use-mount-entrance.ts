"use client";

import { useEffect, useState } from "react";

/**
 * Returns true after the component has mounted on the client.
 * Use this before starting entrance animations to avoid SSR/hydration jumps.
 */
export function useMountEntrance(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  return ready;
}
