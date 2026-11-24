import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrailPulse HK · 香港行山實況通",
  description:
    "香港天文台實時天氣、日落倒數與今日行山適宜度，配 25 條經典路線、互動地圖、海拔剖面及自動執袋清單。Live HKO weather, sunset countdown and 25 classic Hong Kong hiking routes with maps, profiles and a pack checklist.",
  keywords: ["香港行山", "行山路線", "龍脊", "麥理浩徑", "HKO", "hiking Hong Kong", "TrailPulse"],
  openGraph: {
    title: "TrailPulse HK · 香港行山實況通",
    description: "天文台實時天氣 × 25 條香港經典行山路線 × 一分鐘執袋",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#1B4332",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant-HK">
      <body className="paper min-h-screen">{children}</body>
    </html>
  );
}
