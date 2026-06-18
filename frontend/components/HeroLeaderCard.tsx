import { Trophy, Activity, Cpu, Timer, ShieldCheck, CheckCircle } from "lucide-react";
import type { LeaderboardTeam } from "@/lib/types";

export default function HeroLeaderCard({ team }: { team: LeaderboardTeam | null }) {
  if (!team) return null;

  return (
    <div className="gradient-shell" style={{ marginBottom: "var(--spacing-8)" }}>
      <div className="inner" style={{ padding: "var(--spacing-6)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        
        {/* Left: Rank & Team */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-6)" }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(255,215,0,0.15) 0%, rgba(255,165,0,0.05) 100%)",
            border: "1px solid rgba(255,215,0,0.4)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
          }}>
            <Trophy size={24} color="#ffd700" style={{ marginBottom: 4 }} />
            <span className="text-display" style={{ fontSize: 24, lineHeight: 1, color: "#ffd700" }}>#1</span>
          </div>
          
          <div>
            <div className="text-utility text-muted" style={{ marginBottom: "var(--spacing-1)" }}>Current Leader</div>
            <h2 className="text-display" style={{ margin: 0 }}>{team.team_name}</h2>
            <div className="text-mono text-muted" style={{ fontSize: 13, marginTop: 4 }}>ID: {team.team_id}</div>
          </div>
        </div>

        {/* Middle: Score */}
        <div style={{ textAlign: "center", padding: "0 var(--spacing-8)", borderLeft: "1px solid var(--border-default)", borderRight: "1px solid var(--border-default)" }}>
          <div className="text-utility text-primary" style={{ marginBottom: "var(--spacing-2)" }}>Total Score</div>
          <div className="text-display" style={{ fontSize: 56, lineHeight: 1, background: "linear-gradient(90deg, var(--accent-primary), var(--accent-tertiary))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {team.best_score.toFixed(1)}
          </div>
        </div>

        {/* Right: Breakdown */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-4)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)" }}>
            <CheckCircle size={16} className="text-success" />
            <div>
              <div className="text-utility text-muted" style={{ fontSize: 10 }}>Correctness</div>
              <div className="text-metric" style={{ fontSize: 20, lineHeight: 1 }}>{team.correctness.toFixed(1)}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)" }}>
            <ShieldCheck size={16} className="text-tertiary" />
            <div>
              <div className="text-utility text-muted" style={{ fontSize: 10 }}>Evidence</div>
              <div className="text-metric" style={{ fontSize: 20, lineHeight: 1 }}>{team.evidence.toFixed(1)}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)" }}>
            <Timer size={16} className="text-info" />
            <div>
              <div className="text-utility text-muted" style={{ fontSize: 10 }}>Runtime</div>
              <div className="text-metric" style={{ fontSize: 20, lineHeight: 1 }}>{team.runtime_sec ? Math.round(team.runtime_sec) : "--"}s</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)" }}>
            <Activity size={16} className="text-primary" />
            <div>
              <div className="text-utility text-muted" style={{ fontSize: 10 }}>Efficiency</div>
              <div className="text-metric" style={{ fontSize: 20, lineHeight: 1 }}>{team.efficiency.toFixed(1)}</div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
