"use client";
import { useState, useEffect, useCallback } from "react";
import type { AdminRunItem } from "@/lib/types";
import { fetchAdminRuns, deleteRun, restoreRun } from "@/lib/api";
import ScoreBadge from "./ScoreBadge";
import RunDetailDrawer from "./RunDetailDrawer";
import { formatDate, formatDuration } from "@/lib/format";
import { RefreshCw, Search, Eye, Trash2, Undo2 } from "lucide-react";

export default function AdminRunsTable() {
  const [items, setItems] = useState<AdminRunItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [teamFilter, setTeamFilter] = useState("");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [drawerSubId, setDrawerSubId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAdminRuns({
        team_id: teamFilter || undefined,
        include_deleted: includeDeleted,
        limit: 200,
      });
      setItems(data.items);
      setTotal(data.total);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [teamFilter, includeDeleted]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id: number) {
    setActionLoading(id);
    try {
      await deleteRun(id);
      await load();
    } finally {
      setActionLoading(null);
      setConfirmDeleteId(null);
    }
  }

  async function handleRestore(id: number) {
    setActionLoading(id);
    try {
      await restoreRun(id);
      await load();
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <>
      <div style={{ display: "flex", gap: "var(--spacing-3)", flexWrap: "wrap", alignItems: "center", marginBottom: "var(--spacing-6)" }}>
        <div style={{ position: "relative" }}>
          <Search size={16} className="text-muted" style={{ position: "absolute", left: 12, top: 12 }} />
          <input
            id="team-filter-input"
            className="input-field"
            style={{ paddingLeft: 36, width: 240 }}
            placeholder="Filter by team ID…"
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
          />
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)", cursor: "pointer", color: "var(--text-secondary)" }} className="text-utility">
          <input
            type="checkbox"
            checked={includeDeleted}
            onChange={(e) => setIncludeDeleted(e.target.checked)}
            style={{ width: 16, height: 16 }}
          />
          Show deleted
        </label>
        <button className="btn btn-ghost" onClick={load}>
          <RefreshCw size={16} /> Refresh
        </button>
        <span className="text-utility text-muted" style={{ marginLeft: "auto" }}>
          {total} records
        </span>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "var(--spacing-12)" }}>
          <RefreshCw size={24} className="text-primary" style={{ animation: "spin 1s linear infinite" }} />
        </div>
      ) : items.length === 0 ? (
        <div className="glass-card" style={{ padding: "var(--spacing-8)", textAlign: "center" }}>
          <p className="text-secondary">No submissions found.</p>
        </div>
      ) : (
        <div className="table-wrap glass-card">
          <table>
            <thead>
              <tr>
                <th className="text-table-header">ID</th>
                <th className="text-table-header">Team</th>
                <th className="text-table-header">Score</th>
                <th className="text-table-header">C / E / W / F</th>
                <th className="text-table-header">Runtime</th>
                <th className="text-table-header">Models</th>
                <th className="text-table-header">Status</th>
                <th className="text-table-header">Created</th>
                <th className="text-table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.submission_id} style={{ opacity: item.is_deleted ? 0.45 : 1 }}>
                  <td className="text-mono text-muted">#{item.submission_id}</td>
                  <td>
                    <div className="text-table-body" style={{ fontWeight: 600 }}>{item.team_name}</div>
                    <div className="text-utility text-muted" style={{ fontSize: 10 }}>{item.team_id}</div>
                  </td>
                  <td><ScoreBadge score={item.score} /></td>
                  <td className="text-mono text-secondary" style={{ fontSize: 12 }}>
                    {item.correctness.toFixed(0)} / {item.evidence.toFixed(0)} / {item.workflow.toFixed(0)} / {item.efficiency.toFixed(0)}
                  </td>
                  <td className="text-mono text-secondary">{formatDuration(item.runtime_sec)}</td>
                  <td>
                    {item.models_used.slice(0, 2).map((m) => (
                      <span className="badge badge-primary" key={m} style={{ fontSize: 10, padding: "2px 6px", marginRight: 4 }}>{m}</span>
                    ))}
                    {item.models_used.length > 2 && (
                      <span className="text-utility text-muted">+{item.models_used.length - 2}</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge badge-${item.is_deleted ? "danger" : (item.status === "scored" ? "success" : "warning")}`}>
                      {item.is_deleted ? "deleted" : item.status}
                    </span>
                  </td>
                  <td className="text-mono text-secondary" style={{ fontSize: 11 }}>{formatDate(item.created_at)}</td>
                  <td>
                    <div style={{ display: "flex", gap: "var(--spacing-1)" }}>
                      <button className="btn btn-ghost" style={{ padding: "6px 8px" }} onClick={() => setDrawerSubId(item.submission_id)}>
                        <Eye size={14} />
                      </button>
                      {item.is_deleted ? (
                        <button className="btn btn-success" style={{ padding: "6px 8px" }} onClick={() => handleRestore(item.submission_id)} disabled={actionLoading === item.submission_id}>
                          <Undo2 size={14} />
                        </button>
                      ) : (
                        <button className="btn btn-danger" style={{ padding: "6px 8px" }} onClick={() => setConfirmDeleteId(item.submission_id)}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {drawerSubId !== null && <RunDetailDrawer submissionId={drawerSubId} onClose={() => setDrawerSubId(null)} />}

      {confirmDeleteId !== null && (
        <div className="drawer-overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="data-panel" style={{ padding: "var(--spacing-6)", maxWidth: 400 }}>
            <h3 className="text-title" style={{ fontSize: 18, marginBottom: "var(--spacing-4)" }}>Delete Submission</h3>
            <p className="text-secondary" style={{ marginBottom: "var(--spacing-6)" }}>
              Are you sure you want to soft-delete submission #{confirmDeleteId}? It will be hidden from the public leaderboard but can be restored.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--spacing-3)" }}>
              <button className="btn btn-ghost" onClick={() => setConfirmDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(confirmDeleteId)} disabled={actionLoading === confirmDeleteId}>
                {actionLoading === confirmDeleteId ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
