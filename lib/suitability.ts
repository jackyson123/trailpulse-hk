import type { Bi, Suitability, WeatherNow } from "./types";
import { maxRainfall } from "./hko";
import { formatMinutes, minutesUntilSunset, sunsetMinutes } from "./sun";

const SEVERITY: Record<string, number> = {
  WTS: 45,
  WRAINA: 18,
  WRAINB: 38,
  WTCSGNL: 55,
  WHOT: 22,
  WCOLD: 12,
  WMSGNL: 9,
  WFROST: 14,
  WMS: 10,
};

const WARNING_TEXT: Record<string, Bi> = {
  WTS: { zh: "雷暴警告生效，山脊同空曠地方有雷擊風險", en: "Thunderstorm warning — exposed ridges carry lightning risk" },
  WRAINA: { zh: "大雨警告生效，溪澗同石面會滑", en: "Heavy rain warning — streams and rock will be slippery" },
  WRAINB: { zh: "暴雨警告生效，不宜上山", en: "Rainstorm warning — not a day for the hills" },
  WTCSGNL: { zh: "熱帶氣旋信號生效，山區風力更強", en: "Tropical cyclone signal — stronger winds on the hills" },
  WHOT: { zh: "酷熱天氣警告，正午時段避免上斜", en: "Very hot weather warning — avoid midday climbs" },
  WCOLD: { zh: "寒冷天氣警告，高地風寒效應明顯", en: "Cold weather warning — wind chill on high ground" },
  WMSGNL: { zh: "強烈季候風信號，稜線當風位大風", en: "Strong monsoon signal — gusty on exposed ridges" },
  WFROST: { zh: "霜凍警告，高地路面可能結霜", en: "Frost warning — icy patches on high ground" },
};

export function suitability(weather: WeatherNow, now = new Date()): Suitability {
  let score = 92;
  const reasons: Bi[] = [];

  const temp = weather.temperature.find((t) => t.place === "香港天文台")?.value ?? weather.temperature[0]?.value ?? 24;
  if (temp > 32) {
    score -= 32;
    reasons.push({ zh: `市區 ${temp}°C，酷熱，體力消耗大增`, en: `${temp}°C in the city — heat will drain you fast` });
  } else if (temp > 28) {
    score -= 15;
    reasons.push({ zh: `${temp}°C 偏熱，記得多帶水`, en: `${temp}°C — warm, carry extra water` });
  } else if (temp < 12) {
    score -= 14;
    reasons.push({ zh: `${temp}°C 寒冷，高地更凍`, en: `${temp}°C — cold, colder on the tops` });
  } else if (temp >= 16 && temp <= 27) {
    score += 4;
    reasons.push({ zh: `${temp}°C，溫度正合適行山`, en: `${temp}°C — ideal hiking temperature` });
  }

  const humidity = weather.humidity ?? 70;
  if (humidity >= 88) {
    score -= 8;
    reasons.push({ zh: `濕度 ${humidity}%，散熱較慢`, en: `Humidity ${humidity}% — harder to cool down` });
  }

  const uv = weather.uv?.value ?? 0;
  if (uv >= 11) {
    score -= 18;
    reasons.push({ zh: `紫外線指數 ${uv}（極高），要全面防曬`, en: `UV index ${uv} (extreme) — cover up` });
  } else if (uv >= 8) {
    score -= 10;
    reasons.push({ zh: `紫外線指數 ${uv}（甚高）`, en: `UV index ${uv} (very high)` });
  }

  const rain = maxRainfall(weather);
  if (rain >= 10) {
    score -= 30;
    reasons.push({ zh: `部分地區雨量 ${rain} mm，山路濕滑`, en: `${rain} mm of rain in parts — trails will be slick` });
  } else if (rain > 0) {
    score -= 10;
    reasons.push({ zh: `有雨量記錄（最高 ${rain} mm）`, en: `Some rain recorded (up to ${rain} mm)` });
  }

  for (const warning of weather.warnings) {
    const penalty = SEVERITY[warning.code];
    if (penalty) {
      score -= penalty;
      const text = WARNING_TEXT[warning.code];
      reasons.push(text ?? { zh: `${warning.name}生效`, en: `${warning.nameEn || warning.name} in force` });
    }
  }

  const left = minutesUntilSunset(now);
  if (left < 0) {
    score -= 30;
    reasons.push({ zh: "已經日落，摸黑落山風險高", en: "Sun has set — descending in the dark is risky" });
  } else if (left < 180) {
    score -= 18;
    reasons.push({ zh: `距離日落只有 ${Math.floor(left / 60)} 小時 ${left % 60} 分`, en: `Only ${Math.floor(left / 60)}h ${left % 60}m of daylight left` });
  } else if (left < 240) {
    score -= 8;
  }

  score = Math.max(5, Math.min(99, Math.round(score)));
  const grade: Suitability["grade"] = score >= 82 ? "great" : score >= 66 ? "good" : score >= 48 ? "fair" : "poor";

  const buffer = 4 * 60 + 45;
  const latest = sunsetMinutes(now) - buffer;
  const latestStart = latest > now.getHours() * 60 + now.getMinutes() ? formatMinutes(latest) : null;

  return { score, grade, reasons: reasons.slice(0, 3), latestStart };
}

export function gradeLabel(grade: Suitability["grade"], lang: "zh" | "en"): string {
  const labels = {
    great: { zh: "極佳", en: "Excellent" },
    good: { zh: "適宜", en: "Good" },
    fair: { zh: "一般", en: "Fair" },
    poor: { zh: "不宜", en: "Poor" },
  };
  return labels[grade][lang];
}
