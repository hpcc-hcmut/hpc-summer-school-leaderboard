import { NextResponse } from "next/server";
import { cookies } from "next/headers";

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_token")?.value;
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const backend = process.env.BACKEND_INTERNAL_URL ?? "http://localhost:8000";
  const token = await getToken();

  if (!token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch(`${backend}/api/admin/runs/${id}/restore`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Backend unreachable" }, { status: 503 });
  }
}
