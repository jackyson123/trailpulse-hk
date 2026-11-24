"use client";

import { useState } from "react";
import { dict } from "@/lib/i18n";
import { DIFFICULTY_LABEL, DURATIONS, REGIONS, REGION_LABEL, TAG_LABEL } from "@/lib/routes";
import type { Filters, Lang, RouteTag } from "@/lib/types";
import { ChevronDownIcon, SearchIcon } from "./icons";

const TAGS: RouteTag[] = [
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

export default function FilterPanel({
  filters,
  setFilters,
  lang,
  count,
  total,
}: {
  filters: Filters;
  setFilters: (next: Filters) => void;
  lang: Lang;
  count: number;
  total: number;
}) {
  const c = dict[lang];
  const [open, setOpen] = useState(false);

  const activeChips: { key: string; label: string; clear: () => void }[] = [
    ...filters.difficulty.map((level) => ({
      key: `d${level}`,
      label: `${c.grade} ${level} · ${DIFFICULTY_LABEL[level][lang]}`,
      clear: () => setFilters({ ...filters, difficulty: filters.difficulty.filter((d) => d !== level) }),
    })),
    ...(filters.duration !== "all"
      ? [
          {
            key: "dur",
            label: DURATIONS.find((d) => d.id === filters.duration)?.[lang] ?? "",
            clear: () => setFilters({ ...filters, duration: "all" }),
          },
        ]
      : []),
    ...(filters.region !== "all"
      ? [{ key: "reg", label: REGION_LABEL[filters.region]?.[lang] ?? filters.region, clear: () => setFilters({ ...filters, region: "all" }) }]
      : []),
    ...filters.tags.map((tag) => ({
      key: `t${tag}`,
      label: TAG_LABEL[tag][lang],
      clear: () => setFilters({ ...filters, tags: filters.tags.filter((t) => t !== tag) }),
    })),
  ];

  const toggleDifficulty = (level: number) => {
    const has = filters.difficulty.includes(level);
    setFilters({ ...filters, difficulty: has ? filters.difficulty.filter((d) => d !== level) : [...filters.difficulty, level] });
  };

  const toggleTag = (tag: RouteTag) => {
    const has = filters.tags.includes(tag);
    setFilters({ ...filters, tags: has ? filters.tags.filter((t) => t !== tag) : [...filters.tags, tag] });
  };

  return (
    <section className="card overflow-hidden">
      <div className="p-3.5">
        <button type="button" onClick={() => setOpen((v) => !v)} data-testid="filter-toggle" className="flex w-full items-center gap-2 text-left" aria-expanded={open}>
          <SlidersIcon className="h-3.5 w-3.5 text-forest" />
          <span className="text-[13px] font-bold text-forest">{c.filters}</span>
          {activeChips.length > 0 ? (
            <span className="num rounded-full bg-amber px-1.5 py-0.5 text-[9px] font-bold text-white">{activeChips.length}</span>
          ) : null}
          <span className="num ml-auto text-[11px] text-ink/40">
            {count} / {total}
          </span>
          <ChevronDownIcon className={`h-4 w-4 text-ink/40 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        <div className="relative mt-2.5">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink/35" />
          <input
            type="search"
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            placeholder={c.search}
            aria-label={c.search}
            className="w-full rounded-full border border-line bg-white/80 py-2 pl-9 pr-3 text-[12px] text-ink placeholder:text-ink/35 focus:border-forest/40 focus:outline-none focus:ring-2 focus:ring-forest/10"
          />
        </div>

        {activeChips.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1">
            {activeChips.map((chip) => (
              <button key={chip.key} type="button" onClick={chip.clear} className="inline-flex items-center gap-1 rounded-full bg-forest/[0.07] px-2 py-0.5 text-[10px] font-medium text-forest">
                {chip.label}
                <span className="text-[11px] leading-none text-forest/50">×</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {open ? (
        <div className="space-y-3 border-t border-line/70 p-3.5">
          <div>
            <p className="label mb-1.5">{c.difficulty}</p>
            <div className="flex flex-wrap gap-1.5">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  data-testid={`difficulty-${level}`}
                  onClick={() => toggleDifficulty(level)}
                  className={`chip ${filters.difficulty.includes(level) ? "chip-on" : ""}`}
                  aria-pressed={filters.difficulty.includes(level)}
                >
                  <span className="tracking-[0.12em]">{level}</span>
                  <span className="text-[9px] opacity-70">{DIFFICULTY_LABEL[level][lang]}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="label mb-1.5">{c.duration}</p>
            <div className="flex flex-wrap gap-1.5">
              <button type="button" onClick={() => setFilters({ ...filters, duration: "all" })} className={`chip ${filters.duration === "all" ? "chip-on" : ""}`}>
                {c.all}
              </button>
              {DURATIONS.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setFilters({ ...filters, duration: filters.duration === d.id ? "all" : d.id })}
                  className={`chip ${filters.duration === d.id ? "chip-on" : ""}`}
                >
                  {d[lang]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="label mb-1.5">{c.region}</p>
            <div className="flex flex-wrap gap-1.5">
              <button type="button" onClick={() => setFilters({ ...filters, region: "all" })} className={`chip ${filters.region === "all" ? "chip-on" : ""}`}>
                {c.all}
              </button>
              {REGIONS.map((region) => (
                <button
                  key={region}
                  type="button"
                  onClick={() => setFilters({ ...filters, region: filters.region === region ? "all" : region })}
                  className={`chip ${filters.region === region ? "chip-on" : ""}`}
                >
                  {REGION_LABEL[region][lang]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="label mb-1.5">{c.features}</p>
            <div className="flex flex-wrap gap-1.5">
              {TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`chip ${filters.tags.includes(tag) ? "chip-on" : ""}`}
                  aria-pressed={filters.tags.includes(tag)}
                >
                  {TAG_LABEL[tag][lang]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 border-t border-line/70 pt-3">
            <label htmlFor="sort" className="label shrink-0">
              {c.sort}
            </label>
            <div className="relative flex-1">
              <select
                id="sort"
                value={filters.sort}
                onChange={(e) => setFilters({ ...filters, sort: e.target.value as Filters["sort"] })}
                className="w-full appearance-none rounded-full border border-line bg-white/80 py-1.5 pl-3 pr-7 text-[11px] font-medium text-ink focus:border-forest/40 focus:outline-none"
              >
                <option value="recommended">{c.sortRecommended}</option>
                <option value="shortest">{c.sortShortest}</option>
                <option value="easiest">{c.sortEasiest}</option>
                <option value="climb">{c.sortClimb}</option>
              </select>
              <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink/40" />
            </div>
            <button
              type="button"
              onClick={() => setFilters({ q: "", difficulty: [], duration: "all", region: "all", tags: [], sort: "recommended" })}
              className="shrink-0 text-[11px] font-medium text-ink/45 underline decoration-line underline-offset-2 hover:text-forest"
            >
              {c.clear}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function SlidersIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <path d="M4 7h10M18 7h2M4 12h4M12 12h8M4 17h12M20 17h0" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="10" cy="12" r="2" />
      <circle cx="18" cy="17" r="2" />
    </svg>
  );
}
