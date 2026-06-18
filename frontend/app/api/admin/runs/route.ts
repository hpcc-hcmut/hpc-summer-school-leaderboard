import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_token")?.value;
}

export async function GET(req: NextRequest) {
  const backend = process.env.BACKEND_INTERNAL_URL ?? "http://localhost:8000";
  const token = await getToken();

  if (!token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(`${backend}/api/admin/runs`);
  const { searchParams } = req.nextUrl;
  for (const [key, value] of searchParams.entries()) {
    url.searchParams.set(key, value);
  }

  try {
    const res = await fetch(url.toString(), {
      cache: "no-store",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Backend unreachable" }, { status: 503 });
  }
}
