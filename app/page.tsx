import { Suspense } from "react";
import TrailPulseApp from "@/components/TrailPulseApp";
import { getWeather } from "@/lib/hko";

export const dynamic = "force-static";
export const revalidate = 600;

export default async function Page() {
  const weather = await getWeather();
  return (
    <Suspense fallback={<div className="min-h-screen paper" />}>
      <TrailPulseApp initialWeather={weather} />
    </Suspense>
  );
}
