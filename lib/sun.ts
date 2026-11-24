// Solar computation for Hong Kong (NOAA simplified equations).
// Returns minutes after local midnight in Asia/Hong_Kong for a given date.

const HK_LAT = 22.3027;
const HK_LNG = 114.1747;
const TZ_OFFSET = 8;

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;
const norm = (v: number, max: number) => ((v % max) + max) % max;

function dayOfYear(date: Date) {
  const start = Date.UTC(date.getFullYear(), 0, 0);
  const diff = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - start;
  return diff / 86400000;
}

function eventMinutes(date: Date, zenith: number, rise: boolean): number {
  const N = dayOfYear(date);
  const lngHour = HK_LNG / 15;
  const t = N + ((rise ? 6 : 18) - lngHour) / 24;
  const M = 0.9856 * t - 3.289;
  const L = norm(M + 1.916 * Math.sin(rad(M)) + 0.020 * Math.sin(rad(2 * M)) + 282.634, 360);

  let RA = norm(deg(Math.atan(0.91764 * Math.tan(rad(L)))), 360);
  const Lquadrant = Math.floor(L / 90) * 90;
  const RAquadrant = Math.floor(RA / 90) * 90;
  RA = (RA + (Lquadrant - RAquadrant)) / 15;

  const sinDec = 0.39782 * Math.sin(rad(L));
  const cosDec = Math.cos(Math.asin(sinDec));
  const cosH = (Math.cos(rad(zenith)) - sinDec * Math.sin(rad(HK_LAT))) / (cosDec * Math.cos(rad(HK_LAT)));
  if (cosH > 1 || cosH < -1) return rise ? 6 * 60 : 18 * 60;

  let H = rise ? 360 - deg(Math.acos(cosH)) : deg(Math.acos(cosH));
  H /= 15;

  const T = H + RA - 0.06571 * t - 6.622;
  const UT = norm(T - lngHour, 24);
  return Math.round(norm(UT + TZ_OFFSET, 24) * 60);
}

export function sunsetMinutes(date = new Date()): number {
  return eventMinutes(date, 90.833, false);
}

export function sunriseMinutes(date = new Date()): number {
  return eventMinutes(date, 90.833, true);
}

export function civilTwilightEndMinutes(date = new Date()): number {
  return eventMinutes(date, 96, false);
}

export function formatMinutes(minutes: number, lang: "zh" | "en" = "zh"): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return lang === "zh" ? `${h}:${String(m).padStart(2, "0")}` : `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function sunsetDate(date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setMinutes(sunsetMinutes(date));
  return d;
}

export function minutesUntilSunset(now = new Date()): number {
  const sunset = sunsetMinutes(now);
  const current = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  return Math.round(sunset - current);
}
