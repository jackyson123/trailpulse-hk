"use client";

import { dict } from "@/lib/i18n";
import { DIFFICULTY_LABEL, TAG_LABEL, formatTime, routeTime } from "@/lib/routes";
import { formatMinutes, sunsetMinutes } from "@/lib/sun";
import type { Lang, Route } from "@/lib/types";
import { ArrowDownIcon, ArrowUpIcon, ClockIcon, LeafIcon, PinIcon, ShareIcon } from "./icons";

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl bg-sand/45 px-2.5 py-2">
      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-ink/40">{label}</p>
      <p className="num mt-0.5 text-[15px] font-semibold leading-tight text-forest">
        {value}
        {sub ? <span className="ml-0.5 text-[10px] font-normal text-ink/45">{sub}</span> : null}
      </p>
    </div>
  );
}

export default function RouteDetail({
  route,
  lang,
  now,
  onShare,
}: {
  route: Route;
  lang: Lang;
  now: Date | null;
  onShare: () => void;
}) {
  const c = dict[lang];
  const minutes = routeTime(route);
  const finish =
    now === null
      ? null
      : (() => {
          const d = new Date(now);
          d.setMinutes(d.getMinutes() + minutes);
          return d;
        })();
  const buffer = now === null || finish === null ? null : sunsetMinutes(now) - (finish.getHours() * 60 + finish.getMinutes());
  const tight = buffer !== null && buffer < 45;

  return (
    <article className="card overflow-hidden">
      <div className="border-b border-line/70 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber">
              {route.region} · {route.district[lang]}
            </p>
            <h2 data-testid="detail-title" className="mt-1 font-serif text-[26px] leading-tight tracking-tight text-forest sm:text-[30px]">{route.name[lang]}</h2>
          </div>
          <button type="button" onClick={onShare} className="btn shrink-0" aria-label={c.share}>
            <ShareIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{c.share}</span>
          </button>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-forest px-2 py-0.5 text-[10px] font-semibold text-paper">
            {c.grade} {DIFFICULTY_LABEL[route.difficulty][lang]}
          </span>
          {route.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-line bg-white/70 px-2 py-0.5 text-[10px] text-ink/60">
              {TAG_LABEL[tag][lang]}
            </span>
          ))}
        </div>

        <p className="mt-3 text-[12.5px] leading-relaxed text-ink/70">{route.summary[lang]}</p>
      </div>

      <div className="grid grid-cols-3 gap-2 border-b border-line/70 p-4 sm:grid-cols-6 sm:p-5">
        <Stat label={c.distance} value={`${route.distanceKm}`} sub="km" />
        <Stat label={c.ascent} value={`${route.ascentM}`} sub="m" />
        <Stat label={c.descent} value={`${route.descentM}`} sub="m" />
        <Stat label={c.highest} value={`${route.maxElevM}`} sub="m" />
        <Stat label={c.time} value={formatTime(minutes, lang)} />
        <Stat label={c.shade} value={`${route.shade}`} sub="%" />
      </div>

      <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
        <div>
          <h3 className="label">{c.highlights}</h3>
          <ul className="mt-2 space-y-1.5">
            {route.highlights.map((item, i) => (
              <li key={i} className="flex gap-2 text-[11.5px] leading-snug text-ink/70">
                <span className="num mt-[1px] grid h-4 w-4 shrink-0 place-items-center rounded-full bg-amber/12 text-[9px] font-bold text-amber">
                  {i + 1}
                </span>
                {item[lang]}
              </li>
            ))}
          </ul>

          <div className="mt-4 space-y-1.5 rounded-xl bg-forest/[0.04] p-3">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold text-forest/70">
              <ClockIcon className="h-3.5 w-3.5" />
              {c.estFinish}
            </p>
            {finish ? (
              <p className="text-[12px] text-ink/75">
                <span className="num font-semibold text-forest">
                  {String(finish.getHours()).padStart(2, "0")}:{String(finish.getMinutes()).padStart(2, "0")}
                </span>
                <span className="mx-1.5 text-line">|</span>
                {c.daylightBuffer}
                <span className={`num ml-1 font-semibold ${tight ? "text-[#B45309]" : "text-forest"}`}>
                  {buffer} {c.bufferOk}
                </span>
              </p>
            ) : (
              <p className="text-[12px] text-ink/50">—</p>
            )}
            {tight ? <p className="text-[10px] leading-snug text-[#B45309]">{c.bufferShort}</p> : null}
            <p className="text-[10px] text-ink/40">
              {c.sunsetAt} {formatMinutes(sunsetMinutes(now ?? new Date()), lang)}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <h3 className="label">{c.transport}</h3>
            <div className="mt-2 space-y-2">
              <div className="flex gap-2">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-forest text-[9px] font-bold text-paper">A</span>
                <div>
                  <p className="text-[11px] font-semibold text-ink/80">
                    {c.start} · {route.start.name}
                  </p>
                  <p className="text-[10.5px] leading-snug text-ink/55">{route.startTransport[lang]}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-amber text-[9px] font-bold text-white">B</span>
                <div>
                  <p className="text-[11px] font-semibold text-ink/80">
                    {c.end} · {route.end.name}
                  </p>
                  <p className="text-[10.5px] leading-snug text-ink/55">{route.endTransport[lang]}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-line/70 bg-white/60 p-2.5">
              <p className="flex items-center gap-1 text-[10px] font-semibold text-ink/55">
                <PinIcon className="h-3 w-3 text-[#2563A8]" /> {c.supply}
              </p>
              <ul className="mt-1 space-y-1">
                {route.supply.map((s) => (
                  <li key={s.name} className="text-[10px] leading-snug text-ink/60">
                    <span className="font-semibold text-ink/75">{s.name}</span>
                    <span className="block text-[9.5px] text-ink/45">{s.note[lang]}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-line/70 bg-white/60 p-2.5">
              <p className="flex items-center gap-1 text-[10px] font-semibold text-ink/55">
                <LeaveIcon /> {c.retreat}
              </p>
              <ul className="mt-1 space-y-1">
                {route.retreat.map((s) => (
                  <li key={s.name} className="text-[10px] leading-snug text-ink/60">
                    <span className="font-semibold text-ink/75">{s.name}</span>
                    <span className="block text-[9.5px] text-ink/45">{s.note[lang]}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t border-line/70 px-4 py-2.5 text-[10px] text-ink/45 sm:px-5">
        <span className="inline-flex items-center gap-1">
          <ArrowUpIcon className="h-3 w-3" /> {c.ascent} {route.ascentM} m
        </span>
        <span className="inline-flex items-center gap-1">
          <ArrowDownIcon className="h-3 w-3" /> {c.descent} {route.descentM} m
        </span>
        <span className="inline-flex items-center gap-1">
          <LeafIcon className="h-3 w-3" /> {c.shade} {route.shade}%
        </span>
      </div>
    </article>
  );
}

function LeaveIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3 text-moss" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 4h5v16h-5" />
      <path d="M3 12h11M10 8l4 4-4 4" />
    </svg>
  );
}
