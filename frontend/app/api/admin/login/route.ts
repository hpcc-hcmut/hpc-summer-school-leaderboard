import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const backend = process.env.BACKEND_INTERNAL_URL ?? "http://localhost:8000";
  const body = await req.json();

  try {
    const res = await fetch(`${backend}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    const cookieStore = await cookies();
    cookieStore.set("admin_token", data.access_token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12, // 12 hours
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Backend unreachable" }, { status: 503 });
  }
}
