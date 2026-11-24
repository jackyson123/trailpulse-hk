// Geocodes every named waypoint with Nominatim (HK-bounded) to validate/refine
// the hand-authored coordinates. Results are cached in data/geocode.json.
import { promises as fs } from "node:fs";
import path from "node:path";
import { routes } from "./route-defs.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const UA = "TrailPulseHK/1.0 (waypoint validation; contact: jackyson@gmail.com)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const names = [];
for (const r of routes) for (const w of r.waypoints) if (!names.includes(w.name)) names.push(w.name);

let cache = {};
try {
  cache = JSON.parse(await fs.readFile(path.join(ROOT, "data", "geocode.json"), "utf8"));
} catch {}

const [from, to] = process.argv.slice(2).map(Number);
for (let i = from; i < Math.min(to, names.length); i++) {
  const name = names[i];
  if (cache[name]) continue;
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(name)}&format=jsonv2&limit=4&viewbox=113.8,22.55,114.45,22.14&bounded=1&accept-language=zh-Hant,zh,en`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    const data = await res.json();
    cache[name] = data.map((d) => ({ name: d.name || d.display_name, lat: +d.lat, lng: +d.lon, type: d.type, cls: d.class, display: d.display_name }));
    const first = cache[name][0];
    console.log(`${i}. ${name} -> ${first ? `${first.name} (${first.type}) ${first.lat},${first.lng}` : "NOT FOUND"}`);
  } catch (err) {
    console.log(`${i}. ${name} ERROR ${err.message}`);
  }
  await sleep(1200);
}

await fs.writeFile(path.join(ROOT, "data", "geocode.json"), JSON.stringify(cache, null, 1));
console.log(`cached ${Object.keys(cache).length}/${names.length}`);
