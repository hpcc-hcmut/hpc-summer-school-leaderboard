"use client";
import { useState } from "react";
import type { LeaderboardTeam } from "@/lib/types";
import RunDetailDrawer from "./RunDetailDrawer";
import { formatDate, formatDuration } from "@/lib/format";

export default function LeaderboardTable({ teams }: { teams: LeaderboardTeam[] }) {
  const [drawerSubId, setDrawerSubId] = useState<number | null>(null);

  if (teams.length === 0) {
    return (
      <div className="glass-card" style={{ padding: "var(--spacing-8)", textAlign: "center" }}>
        <p className="text-secondary">No submissions yet. Be the first to submit!</p>
      </div>
    );
  }

  return (
    <>
      <div className="table-wrap glass-card">
        <table>
          <thead>
            <tr>
              <th className="text-table-header" style={{ textAlign: "center" }}>Rank</th>
              <th className="text-table-header">Team</th>
              <th className="text-table-header">Score</th>
              <th className="text-table-header">Correct</th>
              <th className="text-table-header">Evid</th>
              <th className="text-table-header">Runtime</th>
              <th className="text-table-header">Models</th>
              <th className="text-table-header">Status</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team, idx) => (
              <tr
                key={team.team_id}
                onClick={() => setDrawerSubId(null)}
                style={{ 
                  cursor: "pointer", 
                  ...(idx === 0 ? { background: "linear-gradient(90deg, rgba(75, 75, 160, 0.1) 0%, transparent 100%)" } : {}) 
                }}
              >
                <td style={{ textAlign: "center", width: 60 }}>
                  <span className="text-display" style={{ fontSize: 20, color: idx === 0 ? "var(--tertiary)" : "var(--text-muted)" }}>
                    {team.rank}
                  </span>
                </td>
                <td>
                  <div className="text-table-body" style={{ fontWeight: 600 }}>{team.team_name}</div>
                  <div className="text-utility text-muted" style={{ fontSize: 10 }}>{team.team_id}</div>
                </td>
                <td>
                  <span className="text-metric" style={{ fontSize: 20, color: idx === 0 ? "var(--primary)" : "var(--text-primary)" }}>
                    {team.best_score.toFixed(1)}
                  </span>
                </td>
                <td className="text-table-body text-secondary">{team.correctness.toFixed(0)}</td>
                <td className="text-table-body text-secondary">{team.evidence.toFixed(0)}</td>
                <td className="text-mono text-secondary">{formatDuration(team.runtime_sec)}</td>
                <td>
                  {team.models_used.slice(0, 2).map(m => (
                    <span key={m} className="badge badge-primary" style={{ marginRight: 4, marginBottom: 4, fontSize: 10, padding: "2px 6px" }}>{m}</span>
                  ))}
                  {team.models_used.length > 2 && <span className="text-utility text-muted">+{team.models_used.length - 2}</span>}
                </td>
                <td>
                  <span className="badge badge-success">Completed</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {drawerSubId !== null && (
        <RunDetailDrawer
          submissionId={drawerSubId}
          onClose={() => setDrawerSubId(null)}
        />
      )}
    </>
  );
}
