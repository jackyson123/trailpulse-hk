"use client";

import { dict } from "@/lib/i18n";
import type { Lang, WeatherNow } from "@/lib/types";
import { RefreshIcon } from "./icons";

function Logo() {
  return (
    <svg width="38" height="38" viewBox="0 0 40 40" aria-hidden className="shrink-0">
      <rect width="40" height="40" rx="12" fill="#1B4332" />
      <g fill="none" stroke="#F7F8F5" strokeOpacity="0.35" strokeWidth="1">
        <path d="M-2 30c6-9 14-4 18-12s12-6 17-2" />
        <path d="M-2 35c7-9 15-4 19-12s12-6 17-2" />
        <path d="M-2 25c5-8 13-4 17-11s11-5 16-2" />
      </g>
      <path d="M7 30l7-10 4 6 3-4 8 8z" fill="#F7F8F5" fillOpacity="0.92" />
      <path d="M7 30l7-10 4 6 3-4 8 8" fill="none" stroke="#1B4332" strokeWidth="1.2" strokeLinejoin="round" />
      <circle cx="30" cy="12" r="3.2" fill="#D97706" />
    </svg>
  );
}

export default function Header({
  lang,
  weather,
  onToggleLang,
  onRefresh,
  refreshing,
}: {
  lang: Lang;
  weather: WeatherNow;
  onToggleLang: () => void;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  const c = dict[lang];
  const updated = weather.updatedAt ? weather.updatedAt.slice(11, 16) : "—";

  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1480px] items-center gap-3 px-4 sm:px-6">
        <Logo />
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-[19px] leading-none tracking-tight text-forest">
              TrailPulse <span className="text-amber">HK</span>
            </span>
            <span className="hidden text-[11px] text-ink/45 sm:inline">{c.brandSub}</span>
          </div>
          <p className="mt-1 hidden truncate text-[11px] text-ink/50 lg:block">{c.tagline}</p>
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <span
            className={`hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-wide sm:inline-flex ${
              weather.stale ? "border-line bg-white text-ink/50" : "border-forest/15 bg-forest/[0.06] text-forest"
            }`}
            title={weather.stale ? c.staleNote : `${c.updated} ${updated}`}
          >
            <span className={`relative flex h-1.5 w-1.5 ${weather.stale ? "" : "animate-pulse-dot"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${weather.stale ? "bg-ink/30" : "bg-forest"}`} />
            </span>
            {weather.stale ? c.stale : `${c.live} · ${updated}`}
          </span>

          <button
            type="button"
            onClick={onRefresh}
            className="btn h-9 w-9 rounded-full px-0 sm:w-auto sm:px-3"
            aria-label={c.refresh}
            title={c.refresh}
          >
            <RefreshIcon className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden text-[11px] sm:inline">{refreshing ? c.refreshing : c.refresh}</span>
          </button>

          <button type="button" onClick={onToggleLang} className="btn-solid h-9" aria-label="Switch language">
            {c.language}
          </button>
        </div>
      </div>
    </header>
  );
}
