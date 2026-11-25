import type { WeatherNow, Warning } from "./types";

const BASE = "https://data.weather.gov.hk/weatherAPI/opendata/weather.php";

const FALLBACK: WeatherNow = {
  updatedAt: "—",
  temperature: [{ place: "香港天文台", value: 24 }],
  humidity: 72,
  uv: { value: 5, desc: "medium" },
  rainfall: [{ place: "香港", max: 0 }],
  icon: [51],
  warnings: [],
  situation: "",
  forecastDesc: "",
  outlook: "",
  days: [],
  stale: true,
};

async function getJson<T>(dataType: string, lang: "tc" | "en" = "tc"): Promise<T | null> {
  try {
    const res = await fetch(`${BASE}?dataType=${dataType}&lang=${lang}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(7000),
      headers: { "User-Agent": "TrailPulseHK/1.0" },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

type RhrRead = {
  rainfall?: { data?: { place: string; max: number }[] };
  humidity?: { data?: { value: number; place: string }[] };
  temperature?: { data?: { place: string; value: number; unit: string }[] };
  uvindex?: { data?: { place: string; value: number; desc: string }[] };
  icon?: number[];
  updateTime?: string;
  warningMessage?: string[];
};

type WarnSum = Record<string, { name?: string; code?: string; actionCode?: string }>;

type Flw = {
  generalSituation?: string;
  forecastDesc?: string;
  outlook?: string;
  updateTime?: string;
};

type Fnd = {
  weatherForecast?: {
    forecastDate: string;
    week: string;
    forecastMintemp?: { value: string | number };
    forecastMaxtemp?: { value: string | number };
    ForecastIcon?: number;
    PSR?: string;
  }[];
};

export async function getWeather(): Promise<WeatherNow> {
  const [rhr, warn, flw, fnd, rhrEn, warnEn, flwEn] = await Promise.all([
    getJson<RhrRead>("rhrread"),
    getJson<WarnSum>("warnsum"),
    getJson<Flw>("flw"),
    getJson<Fnd>("fnd"),
    getJson<RhrRead>("rhrread", "en"),
    getJson<WarnSum>("warnsum", "en"),
    getJson<Flw>("flw", "en"),
  ]);

  if (!rhr) return FALLBACK;

  const warnings: Warning[] = [];
  if (warn) {
    for (const [key, value] of Object.entries(warn)) {
      if (value && value.code && value.actionCode !== "CANCEL") {
        warnings.push({
          code: value.code,
          name: value.name ?? value.code,
          nameEn: warnEn?.[key]?.name ?? warnEn?.[value.code]?.name,
          actionCode: value.actionCode,
        });
      }
    }
  }

  const tempData = rhr.temperature?.data ?? [];
  const tempDataEn = rhrEn?.temperature?.data ?? [];
  const humidity = rhr.humidity?.data?.[0]?.value ?? null;
  const uv = rhr.uvindex?.data?.[0] ?? null;
  const uvEn = rhrEn?.uvindex?.data?.[0] ?? null;
  const rainfall = (rhr.rainfall?.data ?? []).map((r) => ({ place: r.place, max: r.max }));

  const days = (fnd?.weatherForecast ?? []).slice(0, 5).map((d) => ({
    date: d.forecastDate,
    week: d.week,
    min: d.forecastMintemp ? Number(d.forecastMintemp.value) : null,
    max: d.forecastMaxtemp ? Number(d.forecastMaxtemp.value) : null,
    icon: d.ForecastIcon ?? null,
    psr: d.PSR ?? "",
  }));

  return {
    updatedAt: rhr.updateTime ?? "",
    temperature: tempData.map((t, i) => ({ place: t.place, placeEn: tempDataEn[i]?.place, value: t.value })),
    humidity,
    uv: uv ? { value: uv.value, desc: uv.desc, descEn: uvEn?.desc } : null,
    rainfall,
    icon: rhr.icon ?? [],
    warnings,
    situation: flw?.generalSituation || rhr.warningMessage?.join(" ") || "",
    situationEn: flwEn?.generalSituation ?? "",
    forecastDesc: flw?.forecastDesc ?? "",
    forecastDescEn: flwEn?.forecastDesc ?? "",
    outlook: flw?.outlook ?? "",
    outlookEn: flwEn?.outlook ?? "",
    days,
    stale: false,
  };
}

export function temperatureFor(weather: WeatherNow, place?: string): number {
  if (!place) {
    return weather.temperature.find((t) => t.place === "香港天文台")?.value ?? weather.temperature[0]?.value ?? 24;
  }
  const match = weather.temperature.find((t) => place.includes(t.place) || t.place.includes(place));
  return match?.value ?? weather.temperature[0]?.value ?? 24;
}

export function maxRainfall(weather: WeatherNow): number {
  return weather.rainfall.reduce((max, r) => Math.max(max, r.max ?? 0), 0);
}

export type WeatherKind = "sun" | "partly" | "cloud" | "rain" | "storm" | "fog" | "hot" | "cold";

export function weatherKind(icon: number | undefined): WeatherKind {
  if (icon === undefined) return "partly";
  if ([50, 51].includes(icon)) return "sun";
  if ([52, 53, 54].includes(icon)) return "partly";
  if ([55, 56, 57, 58, 59].includes(icon)) return "cloud";
  if ([60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77].includes(icon)) return "rain";
  if ([80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93].includes(icon)) return "rain";
  if ([94, 95, 96, 97, 98, 99].includes(icon)) return "storm";
  if ([43, 44, 45, 46, 47, 48, 49].includes(icon)) return "fog";
  if (icon === 40) return "hot";
  if (icon === 41) return "cold";
  return "partly";
}
