"use client";

import { dict } from "@/lib/i18n";
import { gradeLabel } from "@/lib/suitability";
import { civilTwilightEndMinutes, formatMinutes, sunsetMinutes, sunriseMinutes } from "@/lib/sun";
import type { Lang, Suitability, WeatherNow } from "@/lib/types";
import { weatherKind } from "@/lib/hko";
import { CloudIcon, DropletIcon, FogIcon, PartlyIcon, RainIcon, StormIcon, SunIcon, SunsetIcon, SunriseIcon } from "./icons";

function Condition({ kind, className }: { kind: ReturnType<typeof weatherKind>; className?: string }) {
  switch (kind) {
    case "sun":
      return <SunIcon className={className} />;
    case "cloud":
      return <CloudIcon className={className} />;
    case "rain":
      return <RainIcon className={className} />;
    case "storm":
      return <StormIcon className={className} />;
    case "fog":
      return <FogIcon className={className} />;
    case "hot":
      return <SunIcon className={className} />;
    case "cold":
      return <CloudIcon className={className} />;
    default:
      return <PartlyIcon className={className} />;
  }
}

export function conditionLabel(kind: ReturnType<typeof weatherKind>, lang: Lang) {
  const map = {
    sun: { zh: "天晴", en: "Clear" },
    partly: { zh: "短暫陽光", en: "Sunny intervals" },
    cloud: { zh: "多雲", en: "Cloudy" },
    rain: { zh: "有雨", en: "Rain" },
    storm: { zh: "雷暴", en: "Thunderstorms" },
    fog: { zh: "有霧", en: "Fog" },
    hot: { zh: "酷熱", en: "Very hot" },
    cold: { zh: "寒冷", en: "Cold" },
  } as const;
  return map[kind][lang];
}

export function WeatherCard({ weather, lang }: { weather: WeatherNow; lang: Lang }) {
  const c = dict[lang];
  const kind = weatherKind(weather.icon[0]);
  const station = weather.temperature.find((t) => t.place === "香港天文台") ?? weather.temperature[0];
  const temp = station?.value ?? 24;
  const rain = weather.rainfall.reduce((m, r) => Math.max(m, r.max ?? 0), 0);
  const placeLabel = lang === "zh" ? "香港天文台" : station?.placeEn || "Hong Kong Observatory";
  const uvDesc = lang === "en" ? weather.uv?.descEn || weather.uv?.desc : weather.uv?.desc;
  const rawForecast = lang === "en" ? weather.forecastDescEn || weather.forecastDesc : weather.forecastDesc;
  const forecastDesc = rawForecast.split(lang === "en" ? ". " : "。")[0];

  return (
    <article className="card relative flex flex-col justify-between overflow-hidden p-4 sm:p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="label">{c.weather}</p>
          <p className="mt-1 text-[10px] text-ink/40">
            {placeLabel} · {weather.updatedAt ? weather.updatedAt.slice(11, 16) : "—"}
          </p>
        </div>
        <span className="rounded-full bg-forest/[0.06] px-2 py-0.5 text-[10px] font-semibold text-forest">
          {conditionLabel(kind, lang)}
        </span>
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="flex items-end gap-1">
          <span className="num font-serif text-[46px] leading-[0.9] tracking-tight text-forest sm:text-[52px]">{temp}</span>
          <span className="mb-1 text-sm font-medium text-ink/50">°C</span>
        </div>
        <Condition kind={kind} className="h-12 w-12 text-forest/70" />
      </div>

      <dl className="mt-4 grid grid-cols-3 divide-x divide-line/70 rounded-xl bg-sand/50 py-2 text-center">
        <div>
          <dt className="text-[10px] text-ink/45">{c.humidity}</dt>
          <dd className="num mt-0.5 text-[13px] font-semibold text-ink">{weather.humidity ?? "—"}%</dd>
        </div>
        <div>
          <dt className="text-[10px] text-ink/45">{c.uv}</dt>
          <dd className="num mt-0.5 text-[13px] font-semibold text-ink">
            {weather.uv?.value ?? "—"}
            {weather.uv ? <span className="ml-1 text-[10px] font-normal text-ink/45">{uvDesc}</span> : null}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] text-ink/45">{c.rain}</dt>
          <dd className="num mt-0.5 flex items-center justify-center gap-0.5 text-[13px] font-semibold text-ink">
            <DropletIcon className="h-3 w-3 text-sky-600/70" />
            {rain} mm
          </dd>
        </div>
      </dl>

      <p className="mt-2.5 line-clamp-1 text-[10.5px] text-ink/50">
        {weather.days[0]
          ? `${c.forecast} ${weather.days[0].min ?? "–"}–${weather.days[0].max ?? "–"}°C · ${forecastDesc || weather.days[0].psr || ""}`
          : forecastDesc || c.allClear}
      </p>
    </article>
  );
}

export function SunsetCard({ lang, now }: { lang: Lang; now: Date | null }) {
  const c = dict[lang];
  const d = now ?? new Date();
  const sunset = sunsetMinutes(d);
  const sunrise = sunriseMinutes(d);
  const civil = civilTwilightEndMinutes(d);
  const current = d.getHours() * 60 + d.getMinutes();
  const left = sunset - current;
  const progress = Math.max(0, Math.min(1, (current - sunrise) / Math.max(1, sunset - sunrise)));

  return (
    <article className="card relative flex flex-col justify-between overflow-hidden p-4 sm:p-5">
      <div className="flex items-start justify-between">
        <p className="label">{c.sunset}</p>
        <SunsetIcon className="h-4 w-4 text-amber" />
      </div>

      <div className="mt-2">
        {now === null ? (
          <div className="num font-serif text-[34px] leading-none text-forest/30">—</div>
        ) : left > 0 ? (
          <div className="flex items-baseline gap-1.5">
            <span className="num font-serif text-[38px] leading-none tracking-tight text-forest sm:text-[42px]">
              {Math.floor(left / 60)}
            </span>
            <span className="text-sm font-medium text-ink/60">{c.hoursShort}</span>
            <span className="num font-serif text-[38px] leading-none tracking-tight text-forest sm:text-[42px]">{left % 60}</span>
            <span className="text-sm font-medium text-ink/60">{c.minutesShort}</span>
          </div>
        ) : (
          <div className="font-serif text-[30px] leading-none text-amber">{c.afterSunset}</div>
        )}
        <p className="mt-1 text-[11px] text-ink/50">
          {c.sunsetAt} <span className="num font-semibold text-ink/75">{formatMinutes(sunset, lang)}</span>
          <span className="mx-1.5 text-line">|</span>
          {c.civil} <span className="num text-ink/70">{formatMinutes(civil, lang)}</span>
        </p>
      </div>

      <div className="mt-4">
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-sand">
          <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#F5B857]/70 to-amber" style={{ width: `${progress * 100}%` }} />
          {now !== null && left > 0 ? (
            <span
              className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-forest shadow"
              style={{ left: `${progress * 100}%` }}
            />
          ) : null}
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[10px] text-ink/45">
          <span className="inline-flex items-center gap-1">
            <SunriseIcon className="h-3 w-3" /> {formatMinutes(sunrise, lang)}
          </span>
          <span className="inline-flex items-center gap-1">
            <SunsetIcon className="h-3 w-3" /> {formatMinutes(sunset, lang)}
          </span>
        </div>
      </div>
    </article>
  );
}

const GRADE_STYLE = {
  great: { ring: "#1B4332", chip: "bg-forest text-paper", soft: "bg-forest/[0.06] text-forest" },
  good: { ring: "#3F7052", chip: "bg-forest/85 text-paper", soft: "bg-forest/[0.06] text-forest" },
  fair: { ring: "#D97706", chip: "bg-amber text-white", soft: "bg-amber/10 text-amber" },
  poor: { ring: "#B45309", chip: "bg-[#B45309] text-white", soft: "bg-[#B45309]/10 text-[#B45309]" },
} as const;

export function SuitabilityCard({ data, lang }: { data: Suitability; lang: Lang }) {
  const c = dict[lang];
  const style = GRADE_STYLE[data.grade];
  const circumference = 2 * Math.PI * 34;
  const dash = (data.score / 100) * circumference;

  return (
    <article className="card relative flex flex-col justify-between overflow-hidden p-4 sm:p-5">
      <div className="flex items-start justify-between">
        <p className="label">{c.suitability}</p>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${style.chip}`}>{gradeLabel(data.grade, lang)}</span>
      </div>

      <div className="mt-2 flex items-center gap-4">
        <div className="relative h-[78px] w-[78px] shrink-0">
          <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
            <circle cx="40" cy="40" r="34" fill="none" stroke="#E7EADF" strokeWidth="7" />
            <circle
              cx="40"
              cy="40"
              r="34"
              fill="none"
              stroke={style.ring}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference}`}
              className="transition-[stroke-dasharray] duration-700"
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <span className="num font-serif text-[26px] leading-none text-forest">{data.score}</span>
          </div>
        </div>

        <ul className="min-w-0 space-y-1 text-[11px] leading-snug text-ink/65">
          {data.reasons.length ? (
            data.reasons.map((reason, i) => (
              <li key={i} className="flex gap-1.5">
                <span className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-amber" />
                <span className="line-clamp-2">{reason[lang]}</span>
              </li>
            ))
          ) : (
            <li className="text-ink/50">{c.allClear}</li>
          )}
        </ul>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-sand/50 px-3 py-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink/45">{c.latestStart}</span>
        {data.latestStart ? (
          <span className="num rounded-full bg-forest px-2 py-0.5 text-[12px] font-bold text-paper">{data.latestStart}</span>
        ) : (
          <span className="text-[11px] font-semibold text-amber">{c.pastStart}</span>
        )}
      </div>
    </article>
  );
}
