import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F7F8F5",
        sand: "#EFEDE4",
        forest: { DEFAULT: "#1B4332", deep: "#102A1E", soft: "#2D5A42" },
        moss: "#5B7A66",
        amber: { DEFAULT: "#D97706", soft: "#F5B857", pale: "#FBEAD0" },
        ink: "#15231C",
        line: "#DDE2D7",
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "PingFang HK",
          "Noto Sans TC",
          "Microsoft JhengHei",
          "WenQuanYi Zen Hei",
          "sans-serif",
        ],
        serif: [
          "Iowan Old Style",
          "Palatino Linotype",
          "Georgia",
          "Songti TC",
          "Noto Serif TC",
          "Noto Serif CJK KR",
          "serif",
        ],
        mono: ["ui-monospace", "SF Mono", "Menlo", "Consolas", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(21,35,28,0.04), 0 8px 24px -18px rgba(21,35,28,0.35)",
        lift: "0 18px 40px -24px rgba(16,42,30,0.45)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseDot: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.45", transform: "scale(1.35)" },
        },
      },
      animation: {
        "fade-up": "fade-up .35s ease-out both",
        "pulse-dot": "pulseDot 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
