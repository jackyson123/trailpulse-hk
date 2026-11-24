import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function SunIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" />
    </svg>
  );
}

export function CloudIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M7 18a4 4 0 0 1-.6-7.95A5.5 5.5 0 0 1 17 9.2 3.8 3.8 0 0 1 16.8 18H7Z" />
    </svg>
  );
}

export function PartlyIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <circle cx="9" cy="9" r="3.2" />
      <path d="M9 2.5v1.6M3.5 9H2M4.6 4.6l1.1 1.1M13.4 4.6l-1.1 1.1M4.6 13.4l1.1-1.1" />
      <path d="M11 19.5a3.4 3.4 0 0 1-.5-6.77A4.7 4.7 0 0 1 19.6 12 3.25 3.25 0 0 1 19.2 19.5H11Z" />
    </svg>
  );
}

export function RainIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M7 15a4 4 0 0 1-.6-7.95A5.5 5.5 0 0 1 17 6.2 3.8 3.8 0 0 1 16.8 15H7Z" />
      <path d="M8.5 18.2l-.8 2M12.5 18.2l-.8 2M16.5 18.2l-.8 2" />
    </svg>
  );
}

export function StormIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M7 14a4 4 0 0 1-.6-7.95A5.5 5.5 0 0 1 17 5.2 3.8 3.8 0 0 1 16.8 14H7Z" />
      <path d="M12 15l-2 3.2h3L11 22" />
    </svg>
  );
}

export function FogIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M4 9h16M6 13h12M3 17h18M8 5h8" />
    </svg>
  );
}

export function MountainIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M2.5 19.5l6-11 3.4 6.2 2.1-3.4 7.5 8.2H2.5Z" />
      <path d="M6.9 11.9l1.6-1.3 1.5 1.5" />
    </svg>
  );
}

export function ClockIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M12 7.6V12l3 1.8" />
    </svg>
  );
}

export function SunsetIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M3 17h18M5 21h14" />
      <path d="M7.5 13.5a4.5 4.5 0 0 1 9 0" />
      <path d="M12 3v3M4.6 7.1l1.6 1.6M19.4 7.1l-1.6 1.6M2 13.5h2M20 13.5h2" />
    </svg>
  );
}

export function SunriseIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M3 17h18M5 21h14" />
      <path d="M7.5 13.5a4.5 4.5 0 0 1 9 0" />
      <path d="M12 10V4M9 7l3-3 3 3" />
    </svg>
  );
}

export function RouteIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <circle cx="6" cy="18" r="2.2" />
      <circle cx="18" cy="6" r="2.2" />
      <path d="M8 17.2c2.5-.7 3.1-2.4 3.1-4.4 0-2.4 1-4 3.1-4.6" />
    </svg>
  );
}

export function ArrowUpIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M12 19V5M6.5 10.5L12 5l5.5 5.5" />
    </svg>
  );
}

export function ArrowDownIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M12 5v14M6.5 13.5L12 19l5.5-5.5" />
    </svg>
  );
}

export function DropletIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M12 3.5c3.2 3.6 5.5 6.4 5.5 9.4a5.5 5.5 0 1 1-11 0c0-3 2.3-5.8 5.5-9.4Z" />
    </svg>
  );
}

export function ShirtIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M8 4l-4 2.5 1.7 3.2L8 8.6V20h8V8.6l2.3 1.1L20 6.5 16 4a4 4 0 0 1-8 0Z" />
    </svg>
  );
}

export function BackpackIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M7 8.5V7a5 5 0 0 1 10 0v1.5" />
      <rect x="5" y="8.5" width="14" height="11.5" rx="3" />
      <path d="M9 8.5v3M15 8.5v3M9 16h6" />
    </svg>
  );
}

export function ShieldIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M12 3l7 2.6v5.9c0 4.3-2.9 7.7-7 9.5-4.1-1.8-7-5.2-7-9.5V5.6L12 3Z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function ShareIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <circle cx="6" cy="12" r="2.4" />
      <circle cx="18" cy="6" r="2.4" />
      <circle cx="18" cy="18" r="2.4" />
      <path d="M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6" />
    </svg>
  );
}

export function RefreshIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M20 11a8 8 0 0 0-14-4.2L4 9" />
      <path d="M4 4v5h5" />
      <path d="M4 13a8 8 0 0 0 14 4.2L20 15" />
      <path d="M20 20v-5h-5" />
    </svg>
  );
}

export function ChevronDownIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function CheckIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M4.5 12.5l5 5 10-11" />
    </svg>
  );
}

export function PinIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  );
}

export function WindIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M3 8h11a3 3 0 1 0-3-3" />
      <path d="M3 12h15a3 3 0 1 1-3 3" />
      <path d="M3 16h8" />
    </svg>
  );
}

export function LeafIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M4 20c0-9 5.5-14 16-15 1 10-4 15-12 15H4Z" />
      <path d="M8 16c2-3 4.5-5 8-6.5" />
    </svg>
  );
}

export function SearchIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </svg>
  );
}
