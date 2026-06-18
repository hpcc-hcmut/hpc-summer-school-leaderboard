import type { LeaderboardData, RunDetail, AdminRunsData } from "./types";

export async function fetchLeaderboard(): Promise<LeaderboardData> {
  const res = await fetch("/api/leaderboard", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch leaderboard");
  return res.json();
}

export async function fetchRun(id: number): Promise<RunDetail> {
  const res = await fetch(`/api/runs/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch run");
  return res.json();
}

export async function adminLogin(password: string): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  const data = await res.json();
  if (!res.ok) return { ok: false, error: data.detail || "Login failed" };
  return { ok: true };
}

export async function adminLogout(): Promise<void> {
  await fetch("/api/admin/logout", { method: "POST" });
}

export async function fetchAdminRuns(params?: {
  team_id?: string;
  include_deleted?: boolean;
  limit?: number;
  offset?: number;
}): Promise<AdminRunsData> {
  const url = new URL("/api/admin/runs", window.location.origin);
  if (params?.team_id) url.searchParams.set("team_id", params.team_id);
  if (params?.include_deleted) url.searchParams.set("include_deleted", "true");
  if (params?.limit) url.searchParams.set("limit", String(params.limit));
  if (params?.offset) url.searchParams.set("offset", String(params.offset));
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch admin runs");
  return res.json();
}

export async function deleteRun(id: number): Promise<{ ok: boolean }> {
  const res = await fetch(`/api/admin/runs/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete run");
  return res.json();
}

export async function restoreRun(id: number): Promise<{ ok: boolean }> {
  const res = await fetch(`/api/admin/runs/${id}/restore`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to restore run");
  return res.json();
}
