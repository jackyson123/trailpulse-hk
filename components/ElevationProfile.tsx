"use client";

import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { dict } from "@/lib/i18n";
import type { Lang, Route } from "@/lib/types";

type Point = { d: number; e: number };

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: Point }[] }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg border border-line bg-white/95 px-2.5 py-1.5 text-[11px] shadow-card">
      <span className="num font-semibold text-forest">{point.d} km</span>
      <span className="mx-1.5 text-line">|</span>
      <span className="num text-ink/70">{point.e} m</span>
    </div>
  );
}

export default function ElevationProfile({ route, lang }: { route: Route; lang: Lang }) {
  const c = dict[lang];
  const data = useMemo<Point[]>(() => route.profile.map(([d, e]) => ({ d, e })), [route]);
  const maxElev = Math.max(...data.map((p) => p.e), 50);
  const peak = data.reduce((best, p) => (p.e > best.e ? p : best), data[0]);
  const step = route.distanceKm > 12 ? 3 : route.distanceKm > 6 ? 2 : 1;
  const ticks: number[] = [];
  for (let d = 0; d <= route.distanceKm + 0.01; d += step) ticks.push(Math.round(d * 10) / 10);

  return (
    <div className="card p-4 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="text-[13px] font-bold text-forest">{c.profile}</h3>
          <p className="mt-0.5 text-[10px] text-ink/45">{c.profileHint}</p>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-ink/55">
          <span>
            <span className="label mr-1">{c.highest}</span>
            <span className="num font-semibold text-forest">{route.maxElevM} m</span>
          </span>
          <span>
            <span className="label mr-1">{c.ascent}</span>
            <span className="num font-semibold text-forest">{route.ascentM} m</span>
          </span>
        </div>
      </div>

      <div className="mt-3 h-[186px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="elevFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1B4332" stopOpacity={0.42} />
                <stop offset="55%" stopColor="#5B7A66" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#D97706" stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#E7EADF" strokeDasharray="3 4" vertical={false} />
            <XAxis
              dataKey="d"
              type="number"
              domain={[0, "datamax"]}
              ticks={ticks}
              tickFormatter={(v: number) => `${v}`}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fill: "#7A877E" }}
              height={18}
            />
            <YAxis
              domain={[0, Math.ceil((maxElev + 60) / 100) * 100]}
              width={46}
              tickFormatter={(v: number) => `${v}`}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fill: "#7A877E" }}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#1B4332", strokeOpacity: 0.25, strokeWidth: 1 }} />
            <Area type="monotone" dataKey="e" stroke="#1B4332" strokeWidth={2.2} fill="url(#elevFill)" activeDot={{ r: 3.5, fill: "#D97706", stroke: "#fff", strokeWidth: 2 }} />
            <ReferenceDot x={peak.d} y={peak.e} r={3.5} fill="#D97706" stroke="#fff" strokeWidth={1.5} isFront />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
