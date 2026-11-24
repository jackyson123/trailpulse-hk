export type Lang = "zh" | "en";

export type Bi = { zh: string; en: string };

export type Difficulty = 1 | 2 | 3 | 4 | 5;

export type RouteTag =
  | "sea"
  | "grass"
  | "family"
  | "dog"
  | "sunset"
  | "reservoir"
  | "waterfall"
  | "viewpoint"
  | "heritage"
  | "forest"
  | "night"
  | "island"
  | "beach"
  | "ridge"
  | "geopark";

export type Region = "港島" | "九龍" | "新界東" | "新界西" | "大嶼山" | "離島";

export type Point = { name: string; at: [number, number]; note: Bi };

export type Route = {
  id: string;
  name: Bi;
  region: Region;
  district: Bi;
  difficulty: Difficulty;
  timeMin: number;
  computedTimeMin: number;
  shade: number;
  tags: RouteTag[];
  summary: Bi;
  highlights: Bi[];
  startTransport: Bi;
  endTransport: Bi;
  start: { name: string; lat: number; lng: number };
  end: { name: string; lat: number; lng: number };
  distanceKm: number;
  ascentM: number;
  descentM: number;
  maxElevM: number;
  minElevM: number;
  family: boolean;
  exposure: number;
  path: [number, number][];
  profile: [number, number][];
  supply: Point[];
  retreat: Point[];
  waypointElevations: { name: string; elev: number; offM: number }[];
};

export type Warning = { code: string; name: string; actionCode?: string };

export type WeatherNow = {
  updatedAt: string;
  temperature: { place: string; value: number }[];
  humidity: number | null;
  uv: { value: number; desc: string } | null;
  rainfall: { place: string; max: number }[];
  icon: number[];
  warnings: Warning[];
  situation: string;
  forecastDesc: string;
  outlook: string;
  days: { date: string; week: string; min: number | null; max: number | null; icon: number | null; psr: string }[];
  stale: boolean;
};

export type Suitability = {
  score: number;
  grade: "great" | "good" | "fair" | "poor";
  reasons: Bi[];
  latestStart: string | null;
};

export type Filters = {
  q: string;
  difficulty: number[];
  duration: string;
  region: string;
  tags: RouteTag[];
  sort: "recommended" | "shortest" | "easiest" | "climb";
};

export type ChecklistItem = {
  id: string;
  label: Bi;
  reason: Bi;
  group: "water" | "wear" | "gear" | "safety";
  essential?: boolean;
};
