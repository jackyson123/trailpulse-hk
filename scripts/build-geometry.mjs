// Builds data/routes.json: each leg is routed on the BRouter hiking-beta profile
// (OpenStreetMap footpaths incl. trails), giving real geometry and DEM elevations.
import { promises as fs } from "node:fs";
import path from "node:path";
import { routes } from "./route-defs.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const UA = "TrailPulseHK/1.0 (route data build; contact: jackyson@gmail.com)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function haversine(a, b) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const s =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

async function brouterLeg(from, to, attempt = 0) {
  const url =
    `https://brouter.de/brouter?lonlats=${from[1].toFixed(6)},${from[0].toFixed(6)}|${to[1].toFixed(6)},${to[0].toFixed(6)}` +
    `&profile=hiking-beta&alternativeidx=0&format=geojson`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const f = data?.features?.[0];
    if (!f) throw new Error("no feature");
    const coords = f.geometry.coordinates.map(([lng, lat, ele]) => [lat, lng, typeof ele === "number" ? ele : 0]);
    const props = f.properties || {};
    return {
      coords,
      distance: Number(props["track-length"] || 0),
      ascend: Number(props["filtered ascend"] || 0),
      time: Number(props["total-time"] || 0),
    };
  } catch (err) {
    if (attempt < 3) {
      await sleep(1200 * (attempt + 1));
      return brouterLeg(from, to, attempt + 1);
    }
    console.warn(`  ! BRouter failed ${from} -> ${to}: ${err.message}; straight line`);
    return { coords: [[from[0], from[1], 0], [to[0], to[1], 0]], distance: haversine(from, to) * 1000, ascend: 0, fallback: true };
  }
}

function rdp(points, epsilon) {
  if (points.length < 3) return points;
  const [x1, y1] = points[0];
  const [x2, y2] = points[points.length - 1];
  let maxDist = 0;
  let index = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const [x0, y0] = points[i];
    const denom = Math.hypot(x2 - x1, y2 - y1);
    const d =
      denom === 0
        ? Math.hypot(x0 - x1, y0 - y1)
        : Math.abs((y2 - y1) * x0 - (x2 - x1) * y0 + x2 * y1 - y2 * x1) / denom;
    if (d > maxDist) {
      maxDist = d;
      index = i;
    }
  }
  if (maxDist > epsilon) {
    const left = rdp(points.slice(0, index + 1), epsilon);
    const right = rdp(points.slice(index), epsilon);
    return [...left.slice(0, -1), ...right];
  }
  return [points[0], points[points.length - 1]];
}

function cumulative(points) {
  const cum = [0];
  for (let i = 1; i < points.length; i++) cum.push(cum[i - 1] + haversine(points[i - 1], points[i]));
  return cum;
}

function smooth(values, window = 5) {
  const half = Math.floor(window / 2);
  return values.map((_, i) => {
    const slice = values.slice(Math.max(0, i - half), Math.min(values.length, i + half + 1));
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });
}

await fs.mkdir(path.join(ROOT, "data", "geo"), { recursive: true });
const only = process.argv[2] ? process.argv[2].split(",") : null;
const selected = only ? routes.filter((r) => only.includes(r.id)) : routes;

for (const route of selected) {
  const cacheFile = path.join(ROOT, "data", "geo", `${route.id}.json`);
  try {
    const cached = JSON.parse(await fs.readFile(cacheFile, "utf8"));
    if (cached.path?.length > 2 && cached.version === 2) {
      console.log(`↷ ${route.name.zh} cached`);
      continue;
    }
  } catch {}

  console.log(`\n▶ ${route.name.zh} (${route.id})`);
  const legs = [];
  let track = [];
  let legAscent = 0;
  let fallbacks = 0;
  for (let i = 0; i < route.waypoints.length - 1; i++) {
    const a = [route.waypoints[i].lat, route.waypoints[i].lng];
    const b = [route.waypoints[i + 1].lat, route.waypoints[i + 1].lng];
    const leg = await brouterLeg(a, b);
    if (leg.fallback) fallbacks++;
    const direct = haversine(a, b);
    const ratio = leg.distance / 1000 / Math.max(direct, 0.001);
    if (ratio > 3.0) console.warn(`  ! leg ${route.waypoints[i].name}→${route.waypoints[i + 1].name} detours ${ratio.toFixed(1)}x (${(leg.distance / 1000).toFixed(1)} km vs ${direct.toFixed(1)} km)`);
    legAscent += leg.ascend;
    legs.push({
      from: route.waypoints[i].name,
      to: route.waypoints[i + 1].name,
      km: +(leg.distance / 1000).toFixed(2),
      ratio: +ratio.toFixed(2),
      ascend: Math.round(leg.ascend),
    });
    const coords = track.length && leg.coords.length ? leg.coords.slice(1) : leg.coords;
    track.push(...coords);
    await sleep(400);
  }

  const cum = cumulative(track);
  const totalKm = cum[cum.length - 1];

  // Resample elevation every ~35 m for the profile and gain calculations.
  const stepKm = Math.min(Math.max(totalKm / 320, 0.03), 0.06);
  const sampleIdx = [];
  let nextKm = 0;
  for (let i = 0; i < track.length; i++) {
    while (cum[i] >= nextKm) {
      sampleIdx.push(i);
      nextKm += stepKm;
    }
  }
  if (sampleIdx[sampleIdx.length - 1] !== track.length - 1) sampleIdx.push(track.length - 1);
  const elevRaw = sampleIdx.map((i) => track[i][2]);
  const elevs = smooth(elevRaw, 5);
  let ascent = 0;
  let descent = 0;
  for (let i = 1; i < elevs.length; i++) {
    const d = elevs[i] - elevs[i - 1];
    if (d > 2.5) ascent += d;
    else if (d < -2.5) descent += -d;
  }
  const maxElev = Math.max(...elevRaw);
  const minElev = Math.min(...elevRaw);

  const profileStride = Math.max(1, Math.ceil(sampleIdx.length / 110));
  const profile = [];
  for (let i = 0; i < sampleIdx.length; i += profileStride) {
    profile.push([+cum[sampleIdx[i]].toFixed(2), Math.round(elevs[i])]);
  }
  profile.push([+totalKm.toFixed(2), Math.round(elevs[elevs.length - 1])]);

  let simplified = rdp(track.map((p) => [p[0], p[1]]), 0.00008);
  if (simplified.length > 170) {
    const stride = Math.ceil(simplified.length / 170);
    simplified = simplified.filter((_, i) => i % stride === 0 || i === simplified.length - 1);
  }

  const baseMin = (totalKm / 4.1) * 60 + (ascent / 460) * 60;
  const computedTime = Math.round((baseMin * (1 + route.difficulty * 0.04)) / 5) * 5;
  const start = route.waypoints[0];
  const end = route.waypoints[route.waypoints.length - 1];

  const built = {
    ...route,
    version: 2,
    start: { name: start.name, lat: start.lat, lng: start.lng },
    end: { name: end.name, lat: end.lat, lng: end.lng },
    distanceKm: +totalKm.toFixed(1),
    ascentM: Math.max(Math.round(ascent / 5) * 5, Math.round(legAscent / 5) * 5),
    legAscentM: Math.round(legAscent),
    descentM: Math.round(descent / 5) * 5,
    maxElevM: Math.round(maxElev / 5) * 5,
    minElevM: Math.round(minElev),
    computedTimeMin: computedTime,
    fallbackLegs: fallbacks,
    legs,
    path: simplified.map(([lat, lng]) => [+lat.toFixed(5), +lng.toFixed(5)]),
    profile: profile.filter((p, i) => i === 0 || p[0] > profile[i - 1][0]),
    waypointElevations: route.waypoints.map((w) => {
      let best = 0;
      let bestD = 1e9;
      track.forEach((pt, i) => {
        const d = haversine([w.lat, w.lng], [pt[0], pt[1]]);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      });
      return { name: w.name, elev: Math.round(track[best][2]), offM: Math.round(bestD * 1000) };
    }),
  };

  await fs.writeFile(cacheFile, JSON.stringify(built, null, 1));
  console.log(
    `  ✓ ${totalKm.toFixed(1)} km · ↑${Math.round(ascent)} m (legs ${Math.round(legAscent)}) · max ${Math.round(maxElev)} m · est ${computedTime} min`,
  );
  console.log(`    wp ${built.waypointElevations.map((w) => `${w.name}:${w.elev}(${w.offM}m)`).join(", ")}`);
}

const merged = [];
for (const route of routes) {
  try {
    merged.push(JSON.parse(await fs.readFile(path.join(ROOT, "data", "geo", `${route.id}.json`), "utf8")));
  } catch {}
}
if (merged.length === routes.length) {
  await fs.writeFile(path.join(ROOT, "data", "routes.json"), JSON.stringify(merged, null, 1));
  console.log(`\nWrote data/routes.json with ${merged.length} routes.`);
} else {
  console.log(`\n${merged.length}/${routes.length} routes cached; run again to finish.`);
}
