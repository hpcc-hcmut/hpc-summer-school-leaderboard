import { cookies } from "next/headers";
import type { LeaderboardData } from "@/lib/types";
import DashboardClient from "@/components/DashboardClient";

async function getLeaderboard(): Promise<LeaderboardData | null> {
  const backend = process.env.BACKEND_INTERNAL_URL ?? "http://localhost:8000";
  try {
    const res = await fetch(`${backend}/api/public/leaderboard`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const cookieStore = await cookies();
  const isAdmin = !!cookieStore.get("admin_token");
  const data = await getLeaderboard();

  return <DashboardClient initialData={data} isAdmin={isAdmin} />;
}
