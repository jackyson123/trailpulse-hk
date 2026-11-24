import type { ChecklistItem, Route, WeatherNow } from "./types";
import { maxRainfall } from "./hko";
import { minutesUntilSunset } from "./sun";

const B = (zh: string, en: string) => ({ zh, en });

export function buildChecklist(route: Route, weather: WeatherNow, now = new Date()): ChecklistItem[] {
  const hours = (route.computedTimeMin || route.timeMin) / 60;
  const temp = weather.temperature.find((t) => t.place === "香港天文台")?.value ?? 24;
  const uv = weather.uv?.value ?? 0;
  const rain = maxRainfall(weather);
  const hasRainWarning = weather.warnings.some((w) => w.code.startsWith("WRAIN") || w.code === "WTS");
  const windy = weather.warnings.some((w) => ["WMSGNL", "WTCSGNL"].includes(w.code));

  const waterL = Math.min(4.5, Math.max(1, Math.round((hours * 0.45 + (temp >= 28 ? 0.5 : 0) + (route.ascentM >= 600 ? 0.3 : 0)) * 2) / 2));
  const items: ChecklistItem[] = [
    {
      id: "water",
      group: "water",
      essential: true,
      label: B(`飲用水 ${waterL} 公升`, `${waterL} L of water`),
      reason: B(
        `${hours.toFixed(1)} 小時行程${temp >= 28 ? `、${temp}°C 高溫` : ""}${route.ascentM >= 600 ? "、爬升較多" : ""}，沿途補水點有限`,
        `${hours.toFixed(1)} h on trail${temp >= 28 ? ` at ${temp}°C` : ""}${route.ascentM >= 600 ? " with real climbing" : ""}, refill points are limited`,
      ),
    },
  ];

  if (hours >= 3.5 || temp >= 28 || route.ascentM >= 600) {
    items.push({
      id: "electrolyte",
      group: "water",
      label: B("電解質沖劑／鹽丸", "Electrolyte tablets"),
      reason: B("長時間出汗，只飲水會頭暈", "Long sweat sessions need more than plain water"),
    });
  }

  if (uv >= 6 || route.exposure >= 0.55) {
    items.push({
      id: "sunscreen",
      group: "wear",
      label: B("防曬 SPF50+、太陽眼鏡、帽", "SPF50+, sunglasses, cap"),
      reason: B(`紫外線 ${uv}，路線開揚度 ${Math.round(route.exposure * 100)}%`, `UV ${uv}, ${Math.round(route.exposure * 100)}% exposed trail`),
    });
  }

  if (rain > 0 || hasRainWarning || /雨/.test(weather.forecastDesc)) {
    items.push({
      id: "rain",
      group: "wear",
      label: B("防水風褸／輕便雨衣、背包防水罩", "Rain shell and pack cover"),
      reason: B("天文台預報有雨，山上天氣變化快", "Rain is forecast and hill weather turns fast"),
    });
  }

  if (windy || temp <= 20 || route.maxElevM >= 600) {
    items.push({
      id: "wind",
      group: "wear",
      label: B("防風外套／保暖中層", "Windproof shell or warm mid-layer"),
      reason: B(
        route.maxElevM >= 600 ? "高點風大且溫度低幾度" : "季候風或低溫，稜線當風",
        route.maxElevM >= 600 ? "Windy and colder at the high point" : "Monsoon wind or low temperature on ridges",
      ),
    });
  }

  if (route.maxElevM >= 700 || temp <= 14) {
    items.push({
      id: "warm",
      group: "wear",
      label: B("保暖帽／手套", "Warm hat and gloves"),
      reason: B(`最高點約 ${route.maxElevM} 米，比市區低 5–7°C`, `Summit around ${route.maxElevM} m, 5–7°C colder than town`),
    });
  }

  const left = minutesUntilSunset(now);
  if (left < route.computedTimeMin + 60 || left < 240) {
    items.push({
      id: "headlamp",
      group: "gear",
      label: B("頭燈（連後備電池）", "Headlamp with spare batteries"),
      reason: B(
        left > 0 ? `距離日落約 ${Math.round(left / 60)} 小時，行程可能摸黑` : "已日落，必須有照明",
        left > 0 ? `About ${Math.round(left / 60)} h to sunset — you may finish in the dark` : "After sunset — light is mandatory",
      ),
    });
  }

  if (route.ascentM >= 450 || route.descentM >= 500) {
    items.push({
      id: "poles",
      group: "gear",
      label: B("行山杖", "Trekking poles"),
      reason: B(`累計上落 ${route.ascentM} m / ${route.descentM} m，護膝`, `${route.ascentM} m up and ${route.descentM} m down saves the knees`),
    });
  }

  if (route.difficulty >= 4) {
    items.push({
      id: "gloves",
      group: "gear",
      label: B("手套（攀爬／碎石段）", "Gloves for scrambles"),
      reason: B("難度四星以上，有手腳並用位", "Grade 4+ routes include hands-on sections"),
    });
  }

  if (route.shade >= 55) {
    items.push({
      id: "repellent",
      group: "gear",
      label: B("蚊怕水", "Insect repellent"),
      reason: B("林蔭比例高，溪谷蚊多", "Shaded and damp — mosquitoes are waiting"),
    });
  }

  if (route.tags.includes("beach") || route.tags.includes("island")) {
    items.push({
      id: "swim",
      group: "gear",
      label: B("泳衣／毛巾／防水袋", "Swimwear, towel, dry bag"),
      reason: B("沿途有沙灘，可以落水", "There is a beach on the way"),
    });
  }

  items.push(
    {
      id: "offline",
      group: "safety",
      essential: true,
      label: B("離線地圖（已存此路線）", "Offline map with this route saved"),
      reason: B("山區訊號不穩，靠 GPS 定位", "Signal is patchy; GPS still works offline"),
    },
    {
      id: "firstaid",
      group: "safety",
      essential: true,
      label: B("急救包、膠布、電解質", "First-aid kit and blister plasters"),
      reason: B("基本安全裝備", "Basic safety kit"),
    },
    {
      id: "powerbank",
      group: "safety",
      label: B("充電寶（滿電）", "Charged power bank"),
      reason: B("手機導航＋影相耗電快", "Navigation and photos drain the phone"),
    },
    {
      id: "cash",
      group: "safety",
      label: B("現金／八達通（交通及士多）", "Cash or Octopus for transport and stores"),
      reason: B("村巴、士多未必收電子支付", "Village buses and stores may be cash-only"),
    },
    {
      id: "waste",
      group: "safety",
      label: B("垃圾袋（自己垃圾自己帶走）", "Bag for your own rubbish"),
      reason: B("山徑沒有垃圾桶", "No bins on the trail"),
    },
  );

  return items;
}

export const GROUP_LABEL = {
  water: { zh: "補水", en: "Water" },
  wear: { zh: "穿著", en: "Wear" },
  gear: { zh: "裝備", en: "Gear" },
  safety: { zh: "安全", en: "Safety" },
} as const;
