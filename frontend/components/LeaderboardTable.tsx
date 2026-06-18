"use client";
import { useState } from "react";
import type { LeaderboardTeam } from "@/lib/types";
import ScoreBadge from "./ScoreBadge";
import RunDetailDrawer from "./RunDetailDrawer";
import { formatDate, formatDuration } from "@/lib/format";

const MEDALS = ["🥇", "🥈", "🥉"];

function MiniBar({
  label,
  value,
  max,
  cls,
}: {
  label: string;
  value: number;
  max: number;
  cls: string;
}) {
  return (
    <div className="mini-bar">
      <span className="mini-bar-label">{label}</span>
      <div className="mini-bar-track">
        <div
          className={`mini-bar-fill ${cls}`}
          style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
        />
      </div>
    </div>
  );
}

export default function LeaderboardTable({
  teams,
}: {
  teams: LeaderboardTeam[];
}) {
  const [drawerSubId, setDrawerSubId] = useState<number | null>(null);

  if (teams.length === 0) {
    return (
      <div className="empty-state">
        <div className="icon">🚀</div>
        <p>No submissions yet. Be the first to submit!</p>
      </div>
    );
  }

  return (
    <>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th style={{ textAlign: "center" }}>#</th>
              <th>Team</th>
              <th>Best Score</th>
              <th>Breakdown</th>
              <th>Runtime</th>
              <th>LLM Calls</th>
              <th>Models</th>
              <th>Subs</th>
              <th>Last Submit</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team) => (
              <tr
                key={team.team_id}
                onClick={() => setDrawerSubId(null)}
                style={{ cursor: "default" }}
              >
                <td className="rank-cell">
                  {team.rank <= 3 ? (
                    <span className="rank-badge">{MEDALS[team.rank - 1]}</span>
                  ) : (
                    <span style={{ fontFamily: "var(--font-mono)" }}>{team.rank}</span>
                  )}
                </td>
                <td>
                  <div className="team-name-cell">{team.team_name}</div>
                  <div className="team-id-sub">{team.team_id}</div>
                </td>
                <td>
                  <ScoreBadge score={team.best_score} />
                </td>
                <td>
                  <div className="mini-bar-group">
                    <MiniBar label="C" value={team.correctness} max={40} cls="c" />
                    <MiniBar label="E" value={team.evidence} max={25} cls="e" />
                    <MiniBar label="W" value={team.workflow} max={20} cls="w" />
                    <MiniBar label="F" value={team.efficiency} max={15} cls="ef" />
                  </div>
                </td>
                <td className="mono">{formatDuration(team.runtime_sec)}</td>
                <td className="mono">{team.llm_calls ?? "—"}</td>
                <td>
                  {team.models_used.length > 0 ? (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                      {team.models_used.slice(0, 3).map((m) => (
                        <span className="model-pill" key={m}>
                          {m}
                        </span>
                      ))}
                      {team.models_used.length > 3 && (
                        <span className="model-pill">+{team.models_used.length - 3}</span>
                      )}
                    </div>
                  ) : (
                    <span style={{ color: "var(--text-muted)" }}>—</span>
                  )}
                </td>
                <td className="mono">{team.submissions}</td>
                <td className="mono" style={{ whiteSpace: "nowrap" }}>
                  {formatDate(team.last_submit)}
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
