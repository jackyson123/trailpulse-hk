"use client";

import { dict } from "@/lib/i18n";
import { DIFFICULTY_LABEL, TAG_LABEL, formatTime, routeTime } from "@/lib/routes";
import type { Lang, Route } from "@/lib/types";

export default function RouteList({
  routes,
  selectedId,
  onSelect,
  lang,
  topPickId,
}: {
  routes: Route[];
  selectedId: string;
  onSelect: (id: string) => void;
  lang: Lang;
  topPickId?: string;
}) {
  const c = dict[lang];

  if (!routes.length) {
    return (
      <div className="card p-6 text-center text-[12px] text-ink/50">
        {c.noResults}
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {routes.map((route) => {
        const active = route.id === selectedId;
        return (
          <li key={route.id}>
            <button
              type="button"
              onClick={() => onSelect(route.id)}
              data-testid="route-card"
              data-route-id={route.id}
              aria-pressed={active}
              className={`group w-full rounded-2xl border p-3 text-left transition ${
                active
                  ? "border-forest bg-forest text-paper shadow-lift"
                  : "border-line/80 bg-white/80 hover:-translate-y-0.5 hover:border-forest/30 hover:shadow-card"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className={`truncate font-serif text-[16px] leading-tight ${active ? "text-paper" : "text-forest"}`}>
                      {route.name[lang]}
                    </h3>
                    {route.id === topPickId ? (
                      <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-bold ${active ? "bg-amber text-white" : "bg-amber/12 text-amber"}`}>
                        ★
                      </span>
                    ) : null}
                  </div>
                  <p className={`mt-0.5 truncate text-[10.5px] ${active ? "text-paper/60" : "text-ink/45"}`}>{route.district[lang]}</p>
                </div>
                <span className={`mt-0.5 shrink-0 text-[9px] tracking-[0.22em] ${active ? "text-[#F5B857]" : "text-forest/35"}`} aria-label={DIFFICULTY_LABEL[route.difficulty][lang]}>
                  {"●".repeat(route.difficulty)}
                  <span className={active ? "text-paper/25" : "text-line"}>{"●".repeat(5 - route.difficulty)}</span>
                </span>
              </div>

              <div className={`mt-2 flex items-center gap-2.5 text-[11px] ${active ? "text-paper/80" : "text-ink/60"}`}>
                <span className="num font-semibold">{route.distanceKm} km</span>
                <span className={active ? "text-paper/25" : "text-line"}>·</span>
                <span className="num">↑ {route.ascentM} m</span>
                <span className={active ? "text-paper/25" : "text-line"}>·</span>
                <span className="num">{formatTime(routeTime(route), lang)}</span>
              </div>

              <div className="mt-2 flex flex-wrap gap-1">
                {route.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className={`rounded-full px-1.5 py-0.5 text-[9px] font-medium ${
                      active ? "bg-white/10 text-paper/80" : "bg-sand/80 text-ink/55"
                    }`}
                  >
                    {TAG_LABEL[tag][lang]}
                  </span>
                ))}
                <span className={`ml-auto rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${active ? "text-paper/60" : "text-ink/40"}`}>
                  {DIFFICULTY_LABEL[route.difficulty][lang]}
                </span>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
