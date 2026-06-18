import { Activity } from "lucide-react";

export default function LiveRunTicker() {
  // Stubbed events
  const events = [
    { id: 1, text: "Team 05 submitted run_00128", time: "Just now" },
    { id: 2, text: "Team 03 completed run_00127: 84.9 pts", time: "2m ago", type: "success" },
    { id: 3, text: "Team 08 failed run_00126: timeout", time: "5m ago", type: "danger" },
    { id: 4, text: "Team 01 improved by +2.4 pts", time: "12m ago", type: "primary" }
  ];

  return (
    <div className="glass-card" style={{ marginTop: "var(--spacing-4)", padding: "var(--spacing-3) var(--spacing-6)", display: "flex", alignItems: "center", gap: "var(--spacing-6)", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)", flexShrink: 0, paddingRight: "var(--spacing-4)", borderRight: "1px solid var(--border-default)" }}>
        <Activity size={16} className="text-warning pulse-dot" style={{ background: "transparent" }} />
        <span className="text-utility">Live Feed</span>
      </div>

      <div style={{ display: "flex", gap: "var(--spacing-8)", overflowX: "auto", whiteSpace: "nowrap", scrollbarWidth: "none" }}>
        {events.map((ev) => (
          <div key={ev.id} style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)" }}>
            <span className={`text-subtitle text-${ev.type || "muted"}`} style={{ fontSize: 14 }}>
              {ev.text}
            </span>
            <span className="text-utility text-muted" style={{ fontSize: 10 }}>{ev.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
