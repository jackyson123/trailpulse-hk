"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Checklist from "./Checklist";
import FilterPanel from "./FilterPanel";
import Header from "./Header";
import { SuitabilityCard, SunsetCard, WeatherCard } from "./KpiCards";
import RouteDetail from "./RouteDetail";
import RouteList from "./RouteList";

const RouteMap = dynamic(() => import("./RouteMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-sand/70" />,
});

const ElevationProfile = dynamic(() => import("./ElevationProfile"), {
  ssr: false,
  loading: () => <div className="card h-[250px] animate-pulse bg-sand/40" />,
});
import { buildChecklist } from "@/lib/checklist";
import { dict } from "@/lib/i18n";
import { filterRoutes, getRoute, routes } from "@/lib/routes";
import { suitability } from "@/lib/suitability";
import { sunriseMinutes, sunsetMinutes, formatMinutes } from "@/lib/sun";
import type { Filters, Lang, RouteTag, WeatherNow } from "@/lib/types";
import { SunriseIcon, SunsetIcon } from "./icons";

const DEFAULT_FILTERS: Filters = {
  q: "",
  difficulty: [],
  duration: "all",
  region: "all",
  tags: [],
  sort: "recommended",
};

const ALL_TAGS: RouteTag[] = [
  "sea",
  "viewpoint",
  "sunset",
  "ridge",
  "grass",
  "reservoir",
  "waterfall",
  "family",
  "dog",
  "beach",
  "island",
  "heritage",
  "forest",
  "geopark",
  "night",
];

export default function TrailPulseApp({ initialWeather }: { initialWeather: WeatherNow }) {
  const params = useSearchParams();
  const [lang, setLang] = useState<Lang>("zh");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [selectedId, setSelectedId] = useState<string>("dragons-back");
  const [weather, setWeather] = useState<WeatherNow>(initialWeather);
  const [now, setNow] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [showAll, setShowAll] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const lastApplied = useRef<string | null>(null);
  const c = dict[lang];

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  // Hydration-safe clock + countdown ticker.
  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  // Read a shared plan from the URL (and re-apply it if the query changes).
  useEffect(() => {
    const search = params.toString();
    if (lastApplied.current === search) return;
    lastApplied.current = search;
    const nextLang = params.get("lang");
    if (nextLang === "en" || nextLang === "zh") setLang(nextLang);
    const r = params.get("r");
    if (r && getRoute(r)) setSelectedId(r);
    const d = params.get("d");
    const t = params.get("t");
    const reg = params.get("reg");
    const dur = params.get("dur");
    const sort = params.get("sort");
    const q = params.get("q");
    setFilters({
      q: q ?? "",
      difficulty: d ? d.split(",").map(Number).filter((n) => n >= 1 && n <= 5) : [],
      tags: t ? (t.split(",").filter((tag) => ALL_TAGS.includes(tag as RouteTag)) as RouteTag[]) : [],
      region: reg ?? "all",
      duration: dur ?? "all",
      sort: sort === "shortest" || sort === "easiest" || sort === "climb" ? sort : "recommended",
    });
  }, [params]);

  const today = useMemo(() => suitability(weather, now ?? new Date()), [weather, now]);
  const filtered = useMemo(() => filterRoutes(filters, today.score), [filters, today.score]);
  const selected = getRoute(selectedId) ?? routes[0];
  const checklist = useMemo(() => buildChecklist(selected, weather, now ?? new Date()), [selected, weather, now]);
  const topPickId = filters.sort === "recommended" ? filtered[0]?.id : undefined;

  // Keep the detail panel in step with the filters.
  useEffect(() => {
    if (filtered.length && !filtered.some((route) => route.id === selectedId)) {
      setSelectedId(filtered[0].id);
    }
  }, [filtered, selectedId]);

  // Reflect the current plan in the URL (no navigation, no server round-trip).
  useEffect(() => {
    if (lastApplied.current === null) return;
    const query = new URLSearchParams();
    if (selectedId !== "dragons-back") query.set("r", selectedId);
    if (lang === "en") query.set("lang", "en");
    if (filters.difficulty.length) query.set("d", [...filters.difficulty].sort().join(","));
    if (filters.tags.length) query.set("t", filters.tags.join(","));
    if (filters.region !== "all") query.set("reg", filters.region);
    if (filters.duration !== "all") query.set("dur", filters.duration);
    if (filters.sort !== "recommended") query.set("sort", filters.sort);
    if (filters.q.trim()) query.set("q", filters.q.trim());
    const search = query.toString();
    const url = `${window.location.pathname}${search ? `?${search}` : ""}`;
    window.history.replaceState(null, "", url);
  }, [selectedId, lang, filters]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/weather", { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as WeatherNow;
        if (!data.stale) setWeather(data);
      }
    } catch {
      /* keep the last reading */
    } finally {
      setRefreshing(false);
    }
  }, []);

  const share = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setToast(c.copied);
    } catch {
      setToast(c.copyFailed);
    }
    window.setTimeout(() => setToast(null), 2600);
  }, [c.copied, c.copyFailed]);

  const toggleChecked = (id: string) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  useEffect(() => {
    setChecked({});
  }, [selectedId]);

  const sunrise = now ? sunriseMinutes(now) : sunriseMinutes(new Date());
  const sunset = now ? sunsetMinutes(now) : sunsetMinutes(new Date());

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        lang={lang}
        weather={weather}
        refreshing={refreshing}
        onToggleLang={() => setLang((prev) => (prev === "zh" ? "en" : "zh"))}
        onRefresh={refresh}
      />

      <main className="mx-auto w-full max-w-[1480px] flex-1 px-4 pb-10 pt-4 sm:px-6 sm:pt-5">
        {weather.warnings.length > 0 ? (
          <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border border-amber/30 bg-amber/[0.07] px-3 py-2 text-[11px] leading-snug text-[#8A4A06]">
            <span className="font-bold">⚠</span>
            <span className="font-semibold">
              {weather.warnings.map((w) => (lang === "en" ? w.nameEn || w.name : w.name)).join(" · ")}
            </span>
            {(lang === "en" ? weather.situationEn || weather.situation : weather.situation) ? (
              <span className="hidden text-[#8A4A06]/70 sm:inline">
                — {lang === "en" ? weather.situationEn || weather.situation : weather.situation}
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 md:grid-cols-3">
          <div className="w-[86%] min-w-[270px] shrink-0 snap-start sm:w-auto sm:min-w-0">
            <WeatherCard weather={weather} lang={lang} />
          </div>
          <div className="w-[86%] min-w-[270px] shrink-0 snap-start sm:w-auto sm:min-w-0">
            <SunsetCard lang={lang} now={now} />
          </div>
          <div className="w-[86%] min-w-[270px] shrink-0 snap-start sm:w-auto sm:min-w-0">
            <SuitabilityCard data={today} lang={lang} />
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-[300px_minmax(0,1fr)] lg:mt-5 lg:grid-cols-[352px_minmax(0,1fr)] lg:gap-5">
          <div className="order-1 overflow-hidden rounded-2xl border border-line/80 shadow-card md:col-start-2 md:row-start-1">
            <div className="h-[290px] sm:h-[360px] lg:h-[420px]">
              <RouteMap key={selected.id} route={selected} lang={lang} />
            </div>
          </div>

          <aside className="order-2 min-w-0 md:col-start-1 md:row-span-2 md:row-start-1">
            <div className="thin-scroll space-y-3 md:sticky md:top-[76px] md:max-h-[calc(100vh-92px)] md:overflow-y-auto md:pr-1">
              <FilterPanel filters={filters} setFilters={setFilters} lang={lang} count={filtered.length} total={routes.length} />
              <div className="flex items-center justify-between px-1 pt-1">
                <h2 className="text-[13px] font-bold text-forest">
                  {c.routes} <span className="num ml-1 text-ink/40">{filtered.length}</span>
                </h2>
                <span className="flex items-center gap-2 text-[10px] text-ink/45">
                  <span className="inline-flex items-center gap-1">
                    <SunriseIcon className="h-3 w-3" /> {formatMinutes(sunrise, lang)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <SunsetIcon className="h-3 w-3" /> {formatMinutes(sunset, lang)}
                  </span>
                </span>
              </div>
              <RouteList
                routes={isMobile && !showAll ? filtered.slice(0, 8) : filtered}
                selectedId={selected.id}
                onSelect={setSelectedId}
                lang={lang}
                topPickId={topPickId}
              />
              {filtered.length > 8 ? (
                <button
                  type="button"
                  data-testid="show-all"
                  onClick={() => setShowAll((v) => !v)}
                  className="w-full rounded-full border border-line bg-white/70 py-2 text-[11px] font-semibold text-forest md:hidden"
                >
                  {showAll ? c.collapseList : `${c.showAll} (${filtered.length})`}
                </button>
              ) : null}
              <p className="px-1 pb-1 text-center text-[9px] text-ink/30">
                {routes.length} routes · OSM + SRTM
              </p>
            </div>
          </aside>

          <div className="order-3 space-y-4 md:col-start-2 md:row-start-2">
            <RouteDetail route={selected} lang={lang} now={now} onShare={share} />
            <ElevationProfile route={selected} lang={lang} />
            <Checklist
              items={checklist}
              lang={lang}
              checked={checked}
              onToggle={toggleChecked}
              onReset={() => setChecked({})}
            />
          </div>
        </div>
      </main>

      <footer className="border-t border-line/70 bg-white/40">
        <div className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6">
          <p className="text-[10px] leading-relaxed text-ink/40">{c.dataNote}</p>
          <p className="mt-2 text-[10px] text-ink/35">{c.safetyNote}</p>
          <p className="mt-3 font-serif text-[11px] text-forest/50">{c.footer}</p>
        </div>
      </footer>

      <div
        className={`pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-forest px-4 py-2 text-[11px] font-semibold text-paper shadow-lift transition-all duration-300 ${
          toast ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
        }`}
        role="status"
        aria-live="polite"
      >
        {toast}
      </div>
    </div>
  );
}
