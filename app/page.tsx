import { Suspense } from "react";
import TrailPulseApp from "@/components/TrailPulseApp";
import { getWeather } from "@/lib/hko";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function Page() {
  const weather = await getWeather();
  return (
    <Suspense fallback={<div className="min-h-screen paper" />}>
      <TrailPulseApp initialWeather={weather} />
    </Suspense>
  );
}
