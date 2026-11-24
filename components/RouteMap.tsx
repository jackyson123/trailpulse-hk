"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { dict } from "@/lib/i18n";
import type { Lang, Route } from "@/lib/types";

function markerIcon(html: string, size: number) {
  return L.divIcon({
    html,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export default function RouteMap({ route, lang }: { route: Route; lang: Lang }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const fittedRef = useRef<string>("");
  const c = dict[lang];

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      zoomControl: true,
      scrollWheelZoom: false,
      attributionControl: true,
      preferCanvas: false,
    });
    map.setView([22.36, 114.15], 10);
    L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
      subdomains: "abc",
      maxZoom: 17,
      maxNativeZoom: 17,
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>, SRTM | Map style &copy; <a href="https://opentopomap.org" target="_blank" rel="noreferrer">OpenTopoMap</a> (CC-BY-SA)',
    }).addTo(map);
    L.control.scale({ position: "bottomleft", imperial: false, maxWidth: 90 }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    const onResize = () => {
      if (mapRef.current) map.invalidateSize();
    };
    window.addEventListener("resize", onResize);
    const observer = new ResizeObserver(() => {
      if (mapRef.current) map.invalidateSize();
    });
    observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", onResize);
      map.off();
      try {
        map.remove();
      } catch {
        /* already torn down */
      }
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;

    let tries = 0;
    let timer: number | undefined;

    const render = () => {
      const size = map.getSize();
      if ((size.x < 40 || size.y < 40) && tries < 30) {
        tries += 1;
        timer = window.setTimeout(render, 80);
        return;
      }
      layer.clearLayers();
      map.invalidateSize();

      const points = route.path.map(([lat, lng]) => L.latLng(lat, lng));

      L.polyline(points, { color: "#F7F8F5", weight: 9, opacity: 0.95, lineJoin: "round", lineCap: "round" }).addTo(layer);
      L.polyline(points, { color: "#1B4332", weight: 4.2, opacity: 1, lineJoin: "round", lineCap: "round" }).addTo(layer);

      const startLabel = lang === "zh" ? "起" : "S";
      const endLabel = lang === "zh" ? "終" : "F";
      const loopGap =
        Math.hypot(route.start.lat - route.end.lat, route.start.lng - route.end.lng) * 111000;

      if (loopGap < 120) {
        L.marker([route.start.lat, route.start.lng], {
          icon: markerIcon(
            `<div class="trail-marker" style="width:30px;height:30px;background:#1B4332;box-shadow:0 0 0 3px rgba(217,119,6,.9)">${lang === "zh" ? "起終" : "S/F"}</div>`,
            30,
          ),
          zIndexOffset: 500,
        })
          .bindTooltip(`${c.start} / ${c.end} · ${route.start.name}`, { direction: "top", offset: [0, -14] })
          .addTo(layer);
      } else {
        L.marker([route.start.lat, route.start.lng], {
          icon: markerIcon(`<div class="trail-marker" style="width:26px;height:26px;background:#1B4332">${startLabel}</div>`, 26),
          zIndexOffset: 500,
        })
          .bindTooltip(`${c.start} · ${route.start.name}`, { direction: "top", offset: [0, -12] })
          .addTo(layer);

        L.marker([route.end.lat, route.end.lng], {
          icon: markerIcon(`<div class="trail-marker" style="width:26px;height:26px;background:#D97706">${endLabel}</div>`, 26),
          zIndexOffset: 500,
        })
          .bindTooltip(`${c.end} · ${route.end.name}`, { direction: "top", offset: [0, -12] })
          .addTo(layer);
      }

      for (const point of route.supply) {
        L.marker([point.at[0], point.at[1]], {
          icon: markerIcon(
            `<div class="trail-marker-dot" style="width:13px;height:13px;background:#2563A8" title="${point.name}"></div>`,
            13,
          ),
        })
          .bindTooltip(`${c.supply} · ${point.name}`, { direction: "top", offset: [0, -8] })
          .addTo(layer);
      }

      for (const point of route.retreat) {
        L.marker([point.at[0], point.at[1]], {
          icon: markerIcon(
            `<div class="trail-marker-dot" style="width:13px;height:13px;background:#F7F8F5;border:3px solid #6B7A70" title="${point.name}"></div>`,
            13,
          ),
        })
          .bindTooltip(`${c.retreat} · ${point.name}`, { direction: "top", offset: [0, -8] })
          .addTo(layer);
      }

      if (points.length > 1) {
        const bounds = L.latLngBounds(points);
        if (fittedRef.current !== route.id) {
          map.fitBounds(bounds, { padding: [26, 26], maxZoom: 15, animate: false });
          fittedRef.current = route.id;
        } else if (!bounds.contains(map.getCenter())) {
          map.fitBounds(bounds, { padding: [26, 26], maxZoom: 15, animate: false });
        }
      }
    };

    render();
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [route, lang, c.start, c.end, c.supply, c.retreat]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" aria-label={`${route.name[lang]} map`} />
      <div className="pointer-events-none absolute left-3 top-3 z-[1] flex flex-wrap items-center gap-1.5">
        <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-forest shadow-sm backdrop-blur">
          {route.name[lang]}
        </span>
        <span className="rounded-full bg-white/80 px-2 py-1 text-[9px] font-medium text-ink/55 backdrop-blur">
          {route.distanceKm} km · ↑{route.ascentM} m
        </span>
      </div>
      <div className="pointer-events-none absolute bottom-8 right-3 z-[1] flex flex-col gap-1 rounded-xl bg-white/85 px-2.5 py-2 text-[9px] text-ink/60 shadow-sm backdrop-blur">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-forest" /> {c.legendStart}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber" /> {c.legendEnd}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#2563A8]" /> {c.legendSupply}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full border-2 border-moss/70 bg-white" /> {c.legendRetreat}
        </span>
      </div>
      <span className="pointer-events-none absolute right-3 top-3 z-[1] hidden rounded-full bg-white/80 px-2 py-0.5 text-[9px] text-ink/45 shadow-sm sm:block">
        {c.mapHint}
      </span>
    </div>
  );
}
