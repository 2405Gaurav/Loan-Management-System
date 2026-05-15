"use client";

type Props = {
  lastUpdated: Date | null;
  syncing?: boolean;
};

export function LiveSyncBadge({ lastUpdated, syncing }: Props) {
  const time =
    lastUpdated &&
    lastUpdated.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  return (
    <p className="text-[11px] text-slate-400" aria-live="polite">
      {syncing ? "Updating…" : "Live sync on"}
      {time ? ` · Last updated ${time}` : ""}
    </p>
  );
}
