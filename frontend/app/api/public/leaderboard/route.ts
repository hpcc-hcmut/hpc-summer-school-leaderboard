import { NextResponse } from "next/server";

export async function GET() {
  const backend = process.env.BACKEND_INTERNAL_URL ?? "http://localhost:8000";
  try {
    const res = await fetch(`${backend}/api/public/leaderboard`, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Backend unreachable" }, { status: 503 });
  }
}
