"use client";
import { useState, useEffect, useCallback } from "react";
import type { AdminRunItem } from "@/lib/types";
import { fetchAdminRuns, deleteRun, restoreRun } from "@/lib/api";
import ScoreBadge from "./ScoreBadge";
import RunDetailDrawer from "./RunDetailDrawer";
import { formatDate, formatDuration } from "@/lib/format";

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
      {/* Filters */}
      <div className="admin-filters">
        <input
          id="team-filter-input"
          className="filter-input"
          placeholder="Filter by team ID…"
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
        />
        <label className="filter-checkbox">
          <input
            type="checkbox"
            checked={includeDeleted}
            onChange={(e) => setIncludeDeleted(e.target.checked)}
            id="include-deleted-checkbox"
          />
          Show deleted
        </label>
        <button className="btn btn-ghost" onClick={load} id="refresh-admin-btn">
          🔄 Refresh
        </button>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-muted)" }}>
          {total} records
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 48 }}>
          <div className="spinner" />
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📭</div>
          <p>No submissions found</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Team</th>
                <th>Score</th>
                <th>C / E / W / F</th>
                <th>Runtime</th>
                <th>LLM</th>
                <th>Models</th>
                <th>Slurm Job</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.submission_id}
                  style={{ opacity: item.is_deleted ? 0.45 : 1 }}
                >
                  <td className="mono">#{item.submission_id}</td>
                  <td>
                    <div className="team-name-cell">{item.team_name}</div>
                    <div className="team-id-sub">{item.team_id}</div>
                  </td>
                  <td>
                    <ScoreBadge score={item.score} />
                  </td>
                  <td
                    className="mono"
                    style={{ fontSize: 11, color: "var(--text-secondary)" }}
                  >
                    {item.correctness.toFixed(0)}/{item.evidence.toFixed(0)}/
                    {item.workflow.toFixed(0)}/{item.efficiency.toFixed(0)}
                  </td>
                  <td className="mono">{formatDuration(item.runtime_sec)}</td>
                  <td className="mono">{item.llm_calls ?? "—"}</td>
                  <td>
                    {item.models_used.slice(0, 2).map((m) => (
                      <span className="model-pill" key={m}>
                        {m}
                      </span>
                    ))}
                    {item.models_used.length > 2 && (
                      <span className="model-pill">+{item.models_used.length - 2}</span>
                    )}
                  </td>
                  <td className="mono" style={{ fontSize: 11 }}>
                    {item.slurm_job_id ?? "—"}
                  </td>
                  <td>
                    <span
                      className={`status-badge ${item.is_deleted ? "deleted" : item.status}`}
                    >
                      {item.is_deleted ? "deleted" : item.status}
                    </span>
                  </td>
                  <td className="mono" style={{ whiteSpace: "nowrap", fontSize: 11 }}>
                    {formatDate(item.created_at)}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        className="btn btn-ghost"
                        style={{ padding: "4px 8px", fontSize: 11 }}
                        onClick={() => setDrawerSubId(item.submission_id)}
                        id={`view-run-${item.submission_id}`}
                      >
                        View
                      </button>
                      {item.is_deleted ? (
                        <button
                          className="btn btn-success"
                          style={{ padding: "4px 8px", fontSize: 11 }}
                          onClick={() => handleRestore(item.submission_id)}
                          disabled={actionLoading === item.submission_id}
                          id={`restore-run-${item.submission_id}`}
                        >
                          {actionLoading === item.submission_id ? "…" : "Restore"}
                        </button>
                      ) : (
                        <button
                          className="btn btn-danger"
                          style={{ padding: "4px 8px", fontSize: 11 }}
                          onClick={() => setConfirmDeleteId(item.submission_id)}
                          id={`delete-run-${item.submission_id}`}
                        >
                          Delete
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

      {/* Run detail drawer */}
      {drawerSubId !== null && (
        <RunDetailDrawer
          submissionId={drawerSubId}
          onClose={() => setDrawerSubId(null)}
        />
      )}

      {/* Confirm delete dialog */}
      {confirmDeleteId !== null && (
        <div className="dialog-overlay">
          <div className="dialog-card">
            <div className="dialog-title">🗑️ Delete Submission</div>
            <div className="dialog-body">
              Are you sure you want to soft-delete submission #{confirmDeleteId}?<br />
              It will be hidden from the public leaderboard but can be restored.
            </div>
            <div className="dialog-actions">
              <button
                className="btn btn-ghost"
                onClick={() => setConfirmDeleteId(null)}
                id="cancel-delete-btn"
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleDelete(confirmDeleteId)}
                disabled={actionLoading === confirmDeleteId}
                id="confirm-delete-btn"
              >
                {actionLoading === confirmDeleteId ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
