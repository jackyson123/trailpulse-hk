import { getWeather } from "@/lib/hko";

export const revalidate = 600;

export async function GET() {
  const data = await getWeather();
  return Response.json(data, {
    headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=300" },
  });
}
