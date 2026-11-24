import type { Bi, Filters, Lang, Route, RouteTag } from "./types";
import raw from "@/data/routes.json";

export const routes = raw as unknown as Route[];

export const DIFFICULTY_LABEL: Record<number, Bi> = {
  1: { zh: "輕鬆", en: "Easy" },
  2: { zh: "容易", en: "Easy+" },
  3: { zh: "中等", en: "Moderate" },
  4: { zh: "挑戰", en: "Hard" },
  5: { zh: "艱辛", en: "Very hard" },
};

export const TAG_LABEL: Record<RouteTag, Bi> = {
  sea: { zh: "睇海", en: "Sea views" },
  grass: { zh: "芒草", en: "Silvergrass" },
  family: { zh: "親子", en: "Family" },
  dog: { zh: "帶狗", en: "Dog friendly" },
  sunset: { zh: "日落", en: "Sunset" },
  reservoir: { zh: "水塘", en: "Reservoir" },
  waterfall: { zh: "瀑布", en: "Waterfall" },
  viewpoint: { zh: "靚景", en: "Viewpoint" },
  heritage: { zh: "古蹟", en: "Heritage" },
  forest: { zh: "林蔭", en: "Forest" },
  night: { zh: "夜景", en: "Night view" },
  island: { zh: "離島", en: "Island" },
  beach: { zh: "沙灘", en: "Beach" },
  ridge: { zh: "稜線", en: "Ridge" },
  geopark: { zh: "地質", en: "Geopark" },
};

export const REGIONS = ["港島", "九龍", "新界東", "新界西", "大嶼山", "離島"] as const;

export const REGION_LABEL: Record<string, Bi> = {
  港島: { zh: "港島", en: "HK Island" },
  九龍: { zh: "九龍", en: "Kowloon" },
  新界東: { zh: "新界東", en: "New Territories East" },
  新界西: { zh: "新界西", en: "New Territories West" },
  大嶼山: { zh: "大嶼山", en: "Lantau" },
  離島: { zh: "離島", en: "Outlying islands" },
};

export const DURATIONS = [
  { id: "short", zh: "2 小時內", en: "Under 2 h", test: (min: number) => min <= 120 },
  { id: "half", zh: "2–4 小時", en: "2–4 h", test: (min: number) => min > 120 && min <= 240 },
  { id: "long", zh: "4–6 小時", en: "4–6 h", test: (min: number) => min > 240 && min <= 360 },
  { id: "full", zh: "6 小時以上", en: "6 h+", test: (min: number) => min > 360 },
];

export function routeTime(route: Route): number {
  return route.computedTimeMin || route.timeMin;
}

export function formatTime(minutes: number, lang: Lang): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (lang === "zh") return h > 0 ? `${h} 小時${m ? ` ${m} 分` : ""}` : `${m} 分`;
  return h > 0 ? `${h}h${m ? ` ${m}m` : ""}` : `${m}m`;
}

type Sortable = { route: Route; score: number };

export function filterRoutes(filters: Filters, todayScore: number): Route[] {
  const q = filters.q.trim().toLowerCase();
  const list: Sortable[] = routes
    .filter((route) => {
      if (filters.difficulty.length && !filters.difficulty.includes(route.difficulty)) return false;
      if (filters.region !== "all" && route.region !== filters.region) return false;
      if (filters.tags.length && !filters.tags.every((tag) => route.tags.includes(tag))) return false;
      if (filters.duration !== "all") {
        const bucket = DURATIONS.find((d) => d.id === filters.duration);
        if (bucket && !bucket.test(routeTime(route))) return false;
      }
      if (q) {
        const haystack = `${route.name.zh} ${route.name.en} ${route.district.zh} ${route.district.en} ${route.summary.zh} ${route.tags.join(" ")}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    })
    .map((route) => {
      // "Today's pick": reward shade on hot days, exposure on mild days, short routes late in the day.
      const heatBonus = todayScore > 70 ? route.shade * 0.4 : route.exposure * 20;
      const sunBonus = route.tags.includes("sunset") ? 8 : 0;
      const score = todayScore + heatBonus + sunBonus - route.difficulty * 2 - routeTime(route) / 30;
      return { route, score };
    });

  switch (filters.sort) {
    case "shortest":
      list.sort((a, b) => a.route.distanceKm - b.route.distanceKm);
      break;
    case "easiest":
      list.sort((a, b) => a.route.difficulty - b.route.difficulty || a.route.ascentM - b.route.ascentM);
      break;
    case "climb":
      list.sort((a, b) => b.route.ascentM - a.route.ascentM);
      break;
    default:
      list.sort((a, b) => b.score - a.score);
  }
  return list.map((item) => item.route);
}

export function getRoute(id: string | null): Route | undefined {
  return routes.find((r) => r.id === id);
}

export function difficultyDots(level: number): string {
  return "●".repeat(level) + "○".repeat(Math.max(0, 5 - level));
}
